import type { User, CalendarEvent } from './types';

export const CLIENT_ID = "447637794753-1cs7vg1tigb7abguco0caulb7v64mk3m.apps.googleusercontent.com";
// TODO: Add your API key
export const API_KEY = "AIzaSyD5znlkVslVGWLkWg7r5O5Zz8gdXXEuVoE";
export const SCOPES = "https://www.googleapis.com/auth/calendar";

export const USERS: User[] = [
  { id: 'user-0', name: 'DMC', color: 'bg-gray-700', calendarId: 'c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com', invitationCalId: 'c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com'},
  { id: 'user-1', name: 'Jacek Wodecki', color: 'bg-blue-900', calendarId: 'jacek.wodecki@pwr.edu.pl', invitationCalId: 'jacek.wodecki@pwr.edu.pl' },
  { id: 'user-2', name: 'Anna Michalak', color: 'bg-red-900', calendarId: '3r9m1o50jckmdoop21tcvc4cs7jsguhu@import.calendar.google.com', invitationCalId: 'anna.michalak@pwr.edu.pl' },
  { id: 'user-3', name: 'Justyna Hebda-Sobkowicz', color: 'bg-green-900', calendarId: 'qp4gg6qfk33p6281n3d4hpa1vos60pt6@import.calendar.google.com', invitationCalId: 'justyna.hebda-sobkowicz@pwr.edu.pl' },
  { id: 'user-4', name: 'Przemysław Dąbek', color: 'bg-yellow-900', calendarId: 'nk2v2264olhccmhp9bj7omqc8jkq2p84@import.calendar.google.com', invitationCalId: 'przemyslaw.dabek@pwr.edu.pl' },
  // { id: '5', name: 'Kamil Gromnicki', color: 'bg-purple-500', calendarId: 'evan@example.com' },
  // { id: '6', name: 'User 6 (Fiona)', color: 'bg-pink-500', calendarId: 'fiona@example.com' },
];


