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