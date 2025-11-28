import type { User, CalendarEvent } from '../types';
import { initClient, getAccessToken } from './googleAuthService';

/**
 * Generates a Jitsi Meet meeting URL
 * Jitsi Meet URLs use the pattern: https://meet.jit.si/room-name
 */
function generateJitsiMeetUrl(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let roomName = '';

  // Generate a random 12-character room name
  for (let i = 0; i < 12; i++) {
    roomName += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `https://meet.jit.si/${roomName}`;
}

/**
 * Fetches calendar events for a list of users from the Google Calendar API.
 * 
 * @param users - An array of users to fetch events for.
 * @param startDate - The start of the date range for events.
 * @returns A promise that resolves to an array of calendar events.
 */
export async function fetchEventsForUsers(
  users: User[],
  startDate: Date
): Promise<CalendarEvent[]> {
  // Ensure Google API client is initialized
  try {
    await initClient();
    console.log('Google API client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google API client:', error);
    throw new Error(`Google API client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get access token and set it for API calls
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available. User must sign in first.');
  }

  // Set the access token for GAPI client
  window.gapi.client.setToken({ access_token: token });

  // Calculate the start and end of the week properly
  const startOfWeek = new Date(startDate);
  startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7); // Next Monday
  endOfWeek.setHours(0, 0, 0, 0);

  const timeMin = startOfWeek.toISOString();
  const timeMax = endOfWeek.toISOString();

  console.log('Fetching events for date range:', {
    startOfWeek: startOfWeek.toISOString(),
    endOfWeek: endOfWeek.toISOString(),
    timeMin,
    timeMax
  });

  let allEvents: CalendarEvent[] = [];

  for (const user of users) {
    for (const cal of user.calendarId) {
      try {
        console.log(`Fetching events for ${user.name} (${cal})`);
        const res = await window.gapi.client.calendar.events.list({
          calendarId: cal,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 100, // Increase from default 25
          showDeleted: false,
        });

        console.log(`Found ${res.result.items?.length || 0} raw events for ${user.name}`);

        const events = res.result.items;
        if (events && events.length) {
          const userEvents: CalendarEvent[] = events
            .map((event: any) => {
              if (!event.id || !event.summary) {
                console.warn('Skipping event with missing id or summary:', event);
                return null;
              }

              // Better all-day event detection
              const isAllDay = !event.start.dateTime && event.start.date;
              const startDate = isAllDay
                ? new Date(event.start.date + 'T00:00:00.000Z')
                : new Date(event.start.dateTime);

              let endDate = isAllDay
                ? new Date(event.end.date + 'T23:59:59.999Z')
                : new Date(event.end.dateTime);

              // Fix for Google Calendar API all-day events ending one day later
              if (isAllDay && event.end.date) {
                const endDateObj = new Date(event.end.date);
                endDateObj.setDate(endDateObj.getDate()); // Subtract 1 day
                endDate = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate(), 23, 59, 59, 999);
              }

              console.log('Processing event:', {
                id: event.id,
                title: event.summary,
                isAllDay,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                startInRange: startDate >= startOfWeek && startDate < endOfWeek,
                endInRange: endDate >= startOfWeek && endDate < endOfWeek,
                duration: endDate.getTime() - startDate.getTime(),
                daysDifference: Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
              });

              // Special logging for multi-day events
              if (Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) > 1) {
                console.log('MULTI-DAY EVENT DETECTED:', {
                  title: event.summary,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                  span: `${Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))} days`
                });
              }

              return {
                id: event.id,
                title: event.summary,
                start: startDate,
                end: endDate,
                userId: user.id,
                description: event.description,
              };
            })
            .filter((event): event is CalendarEvent => event !== null);
          allEvents = allEvents.concat(userEvents);
        }
      } catch (err: any) {
        console.error(`Failed to fetch events for ${user.name}:`, err);
        console.error(`Calendar ID: ${cal}`);
        console.error(`Error details:`, {
          message: err.message,
          status: err.status,
          code: err.code,
          stack: err.stack
        });

        // Provide more specific error messages based on error type
        if (err.status === 403) {
          console.error(`403 Forbidden: Check if the API key is valid and calendar is shared properly`);
        } else if (err.status === 400) {
          console.error(`400 Bad Request: Check calendar ID format and API parameters`);
        } else if (err.status === 401) {
          console.error(`401 Unauthorized: Check authentication and API key permissions`);
        }
      }
    }
  }
  
  return allEvents;
}


/**
 * Creates a new calendar event and sends invitations to attendees.
 *
 * @param meeting - The meeting details to create.
 * @param attendees - Array of attendee email addresses.
 * @param targetCalendarId - The calendar ID where the event should be created.
 * @returns A promise that resolves to the created event details.
 */
export async function createCalendarEvent(
    meeting: { title: string; start: Date; end: Date; description?: string; includeJitsiMeet?: boolean },
    attendees: string[],
    targetCalendarId: string
  ): Promise<any> {
  // Ensure Google API client is initialized
  try {
    await initClient();
    console.log('Google API client initialized for event creation');
  } catch (error) {
    console.error('Failed to initialize Google API client:', error);
    throw new Error(`Google API client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get access token and set it for API calls
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available. User must sign in first.');
  }

  // Set the access token for GAPI client
  window.gapi.client.setToken({ access_token: token });

  // Prepare attendees list
  const eventAttendees = attendees.map(email => ({
    email: email
  }));

  // Create the event object
  const event: any = {
    summary: meeting.title,
    start: {
      dateTime: meeting.start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw'
    },
    end: {
      dateTime: meeting.end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw'
    },
    attendees: eventAttendees,
    description: meeting.description || 'Meeting scheduled via Meeting Scheduler',
    status: 'confirmed',
    sendUpdates: 'all' // This will send invitation emails to attendees
  };

  // Add Jitsi Meet link if requested
  if (meeting.includeJitsiMeet) {
    const jitsiUrl = generateJitsiMeetUrl();

    // Add Jitsi Meet URL to location and description
    event.location = jitsiUrl;
    if (meeting.description) {
      event.description = meeting.description + '\n\nJoin the meeting: ' + jitsiUrl;
    } else {
      event.description = 'Join the meeting: ' + jitsiUrl;
    }
  }

  try {
    console.log('Creating calendar event:', {
      title: meeting.title,
      start: meeting.start,
      end: meeting.end,
      attendees: attendees,
      calendarId: targetCalendarId,
      includeJitsiMeet: meeting.includeJitsiMeet,
      jitsiUrl: meeting.includeJitsiMeet ? 'Will be generated' : 'Not included'
    });

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: targetCalendarId,
      resource: event,
      sendUpdates: 'all'
    });

    console.log('Calendar event created successfully:', response.result);
    return response.result;

  } catch (error: any) {
    console.error('Failed to create calendar event:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });

    // Provide more specific error messages
    if (error.status === 403) {
      throw new Error('Permission denied. Please check calendar permissions and ensure you have write access.');
    } else if (error.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    } else if (error.status === 400) {
      throw new Error('Invalid event data. Please check the meeting details and try again.');
    } else {
      throw new Error(`Failed to create calendar event: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Deletes a calendar event from Google Calendar.
 *
 * @param eventId - The ID of the event to delete.
 * @param calendarId - The calendar ID where the event exists.
 * @returns A promise that resolves when the event is deleted.
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId: string
): Promise<void> {
  // Ensure Google API client is initialized
  try {
    await initClient();
    console.log('Google API client initialized for event deletion');
  } catch (error) {
    console.error('Failed to initialize Google API client:', error);
    throw new Error(`Google API client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get access token and set it for API calls
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available. User must sign in first.');
  }

  // Set the access token for GAPI client
  window.gapi.client.setToken({ access_token: token });

  try {
    console.log('Deleting calendar event:', { eventId, calendarId });

    await window.gapi.client.calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
      sendUpdates: 'all' // Notify attendees that the event was cancelled
    });

    console.log('Calendar event deleted successfully');

  } catch (error: any) {
    console.error('Failed to delete calendar event:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });

    // Provide more specific error messages
    if (error.status === 403) {
      throw new Error('Permission denied. Please check calendar permissions.');
    } else if (error.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    } else if (error.status === 404) {
      throw new Error('Event not found. It may have already been deleted.');
    } else if (error.status === 410) {
      throw new Error('Event no longer exists in calendar.');
    } else {
      throw new Error(`Failed to delete calendar event: ${error.message || 'Unknown error'}`);
    }
  }
}