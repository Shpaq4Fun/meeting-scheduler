import type { User, CalendarEvent } from '../types';
import { initClient, getAccessToken } from './googleAuthService';

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

  const timeMin = startDate.toISOString();
  const timeMax = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let allEvents: CalendarEvent[] = [];

  for (const user of users) {
    try {
      const res = await window.gapi.client.calendar.events.list({
        calendarId: user.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = res.result.items;
      if (events && events.length) {
        const userEvents: CalendarEvent[] = events
          .map((event: any) => {
            if (!event.id || !event.summary) {
              console.warn('Skipping event with missing id or summary:', event);
              return null;
            }
            return {
              id: event.id,
              title: event.summary,
              start: new Date(event.start.dateTime || event.start.date),
              end: new Date(event.end.dateTime || event.end.date),
              userId: user.id,
            };
          })
          .filter((event): event is CalendarEvent => event !== null);
        allEvents = allEvents.concat(userEvents);
      }
    } catch (err: any) {
      console.error(`Failed to fetch events for ${user.name}:`, err);
      console.error(`Calendar ID: ${user.calendarId}`);
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
  meeting: { title: string; start: Date; end: Date; description?: string },
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
  const event = {
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

  try {
    console.log('Creating calendar event:', {
      title: meeting.title,
      start: meeting.start,
      end: meeting.end,
      attendees: attendees,
      calendarId: targetCalendarId
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