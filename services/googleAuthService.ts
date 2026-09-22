import { CLIENT_ID, API_KEY, SCOPES } from '../constants';

// Global variable to store the token client
let tokenClient: any = null;
let accessToken: string | null = null;

// Helper to wait for global script dependencies (gapi and google.accounts.oauth2)
const waitForGoogleScripts = async (timeoutMs = 10000): Promise<void> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (
      typeof window !== 'undefined' &&
      window.gapi &&
      window.google &&
      window.google.accounts &&
      window.google.accounts.oauth2
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Google identity or API scripts failed to load in time.');
};

let initPromise: Promise<void> | null = null;

export const initClient = async (): Promise<void> => {
  if (tokenClient) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await waitForGoogleScripts();

    // Load GAPI client and load the calendar API
    await new Promise<void>((resolve) => {
      window.gapi.load('client', async () => {
        try {
          if (API_KEY) {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
          }
        } catch (error) {
          console.warn('gapi.client.init warning:', error);
        }

        // Ensure calendar API methods (window.gapi.client.calendar) are loaded
        try {
          if (!window.gapi.client.calendar) {
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');
          }
          console.log('Google Calendar API client loaded successfully');
        } catch (loadError) {
          console.error('Failed to load Google Calendar API discovery doc:', loadError);
        }

        resolve();
      });
    });

    if (!CLIENT_ID) {
      throw new Error('VITE_CLIENT_ID is not defined. Please check environment variables.');
    }

    // Initialize Google Identity Services token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          console.error('Token client error:', response);
        } else {
          accessToken = response.access_token;
          console.log('Access token obtained successfully');
        }
      },
    });
  })();

  return initPromise;
};

export const signIn = async () => {
  if (!tokenClient) {
    await initClient();
  }

  if (!tokenClient) {
    throw new Error('Token client not initialized. Google scripts may be blocked or unavailable.');
  }

  return new Promise((resolve, reject) => {
    const originalCallback = tokenClient.callback;
    tokenClient.callback = (response: any) => {
      if (originalCallback) {
        originalCallback(response);
      }
      if (response.error) {
        reject(new Error(`Sign-in failed: ${response.error}`));
      } else {
        resolve(response);
      }
    };

    // Request access token (prompts Google OAuth consent popup)
    tokenClient.requestAccessToken();
  });
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const signOut = () => {
  accessToken = null;
  console.log('User signed out');
};

// Declare global Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
