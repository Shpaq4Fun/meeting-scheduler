import type { User, CalendarEvent } from './types';

export const CLIENT_ID = "447637794753-1cs7vg1tigb7abguco0caulb7v64mk3m.apps.googleusercontent.com";
// TODO: Add your API key
export const API_KEY = "AIzaSyD5znlkVslVGWLkWg7r5O5Zz8gdXXEuVoE";
export const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export const USERS: User[] = [
  { id: 'user-0', name: 'DMC', color: 'bg-gray-500', calendarId: 'c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com' },
  { id: 'user-1', name: 'Jacek Wodecki', color: 'bg-blue-500', calendarId: 'jacek.wodecki@pwr.edu.pl' },
  { id: 'user-2', name: 'Anna Michalak', color: 'bg-red-500', calendarId: '3r9m1o50jckmdoop21tcvc4cs7jsguhu@import.calendar.google.com' },
  { id: 'user-3', name: 'Justyna Hebda-Sobkowicz', color: 'bg-green-500', calendarId: 'chris@example.com' },
  // { id: '4', name: 'User 4 (Diana)', color: 'bg-yellow-500', calendarId: 'diana@example.com' },
  // { id: '5', name: 'User 5 (Evan)', color: 'bg-purple-500', calendarId: 'evan@example.com' },
  // { id: '6', name: 'User 6 (Fiona)', color: 'bg-pink-500', calendarId: 'fiona@example.com' },
];


