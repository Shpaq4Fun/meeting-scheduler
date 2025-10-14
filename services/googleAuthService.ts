import { CLIENT_ID, API_KEY, SCOPES } from '../constants';

// Global variable to store the token client
let tokenClient: any = null;
let accessToken: string | null = null;

export const initClient = async () => {
  return new Promise((resolve, reject) => {
    // Load GAPI client
    window.gapi.load('client', async () => {
      try {
        // Initialize GAPI client
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });

        console.log('Google API client initialized successfully');

        // Initialize Google Identity Services token client
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
              console.error('Token client error:', response);
              reject(new Error(`Token error: ${response.error}`));
            } else {
              accessToken = response.access_token;
              console.log('Access token obtained successfully');
              resolve(undefined);
            }
          },
        });

        resolve(undefined);
      } catch (error) {
        console.error('Failed to initialize Google API client:', error);
        reject(error);
      }
    });
  });
};

export const signIn = async () => {
  if (!tokenClient) {
    throw new Error('Token client not initialized');
  }

  return new Promise((resolve, reject) => {
    // Request access token
    tokenClient.requestAccessToken();

    // Set up a callback to handle the response
    const originalCallback = tokenClient.callback;
    tokenClient.callback = (response: any) => {
      originalCallback(response);
      if (response.error) {
        reject(new Error(`Sign-in failed: ${response.error}`));
      } else {
        resolve(response);
      }
    };
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
