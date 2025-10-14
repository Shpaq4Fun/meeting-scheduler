import type { User, CalendarEvent } from './types';

export const USERS: User[] = [
  { id: 'user-0', name: 'DMC', color: 'bg-gray-500', calendarId: 'c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com' },
  { id: 'user-1', name: 'Jacek Wodecki', color: 'bg-blue-500', calendarId: 'jacek.wodecki@pwr.edu.pl' },
  { id: 'user-2', name: 'Anna Michalak', color: 'bg-red-500', calendarId: '3r9m1o50jckmdoop21tcvc4cs7jsguhu@import.calendar.google.com' },
  { id: 'user-3', name: 'Justyna Hebda-Sobkowicz', color: 'bg-green-500', calendarId: 'chris@example.com' },
  // { id: '4', name: 'User 4 (Diana)', color: 'bg-yellow-500', calendarId: 'diana@example.com' },
  // { id: '5', name: 'User 5 (Evan)', color: 'bg-purple-500', calendarId: 'evan@example.com' },
  // { id: '6', name: 'User 6 (Fiona)', color: 'bg-pink-500', calendarId: 'fiona@example.com' },
];

const getDayOfWeek = (date: Date, dayOfWeek: number) => { // 1=Monday, ... 7=Sunday
  const d = new Date(date);
  const currentDay = d.getDay(); // 0=Sunday, 1=Monday, ...
  const dayIndex = currentDay === 0 ? 6 : currentDay - 1; // 0=Monday, ... 6=Sunday
  const diff = d.getDate() - dayIndex + (dayOfWeek - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const createEventDate = (date: Date, hours: number, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};


const today = new Date();
const monday = getDayOfWeek(today, 1);
const tuesday = getDayOfWeek(today, 2);
const wednesday = getDayOfWeek(today, 3);
const thursday = getDayOfWeek(today, 4);
const friday = getDayOfWeek(today, 5);
const saturday = getDayOfWeek(today, 6);
const sunday = getDayOfWeek(today, 7);


export const MOCK_EVENTS: Record<string, CalendarEvent[]> = {
  'user-0': [
    { id: 'e0-1', title: 'Seminarium DMC', start: createEventDate(monday, 17, 0), end: createEventDate(monday, 19, 0), userId: 'user-0' },
    { id: 'e0-2', title: 'C - Algebra', start: createEventDate(wednesday, 17, 15), end: createEventDate(wednesday, 19, 0), userId: 'user-0' },
    { id: 'e0-3', title: 'Client Call', start: createEventDate(tuesday, 17, 0), end: createEventDate(tuesday, 19, 0), userId: 'user-0' },
    { id: 'e0-4', title: 'Jacek zjazd klasowy', start: createEventDate(saturday, 17, 0), end: createEventDate(saturday, 19, 0), userId: 'user-0' },
    { id: 'e0-5', title: 'Spotkanie VC', start: createEventDate(thursday, 17, 0), end: createEventDate(thursday, 19, 0), userId: 'user-0' },
  ],
  'user-1': [
    { id: 'e1-1', title: 'Seminarium DMC', start: createEventDate(monday, 9, 0), end: createEventDate(monday, 11, 0), userId: 'user-1' },
    { id: 'e1-2', title: 'C - Algebra', start: createEventDate(wednesday, 13, 15), end: createEventDate(wednesday, 15, 0), userId: 'user-1' },
    { id: 'e1-3', title: 'Client Call', start: createEventDate(tuesday, 14, 0), end: createEventDate(tuesday, 15, 30), userId: 'user-1' },
    { id: 'e1-4', title: 'Jacek zjazd klasowy', start: createEventDate(saturday, 17, 0), end: createEventDate(saturday, 19, 0), userId: 'user-1' },
    { id: 'e1-5', title: 'Spotkanie VC', start: createEventDate(thursday, 14, 0), end: createEventDate(thursday, 15, 0), userId: 'user-1' },
  ],
  'user-2': [
    { id: 'e2-1', title: 'Project Meeting', start: createEventDate(monday, 9, 30), end: createEventDate(monday, 10, 30), userId: 'user-2' },
    { id: 'e2-2', title: 'Dentist', start: createEventDate(friday, 14, 0), end: createEventDate(friday, 15, 0), userId: 'user-2' },
    { id: 'e2-3', title: 'Maciej Chodowiec urodziny', start: createEventDate(tuesday, 6, 0), end: createEventDate(tuesday, 8, 0), userId: 'user-2' },
    { id: 'e2-4', title: 'C - Algebra', start: createEventDate(thursday, 13, 15), end: createEventDate(thursday, 15, 0), userId: 'user-2' },
    { id: 'e2-5', title: 'Yoga Class', start: createEventDate(wednesday, 7, 0), end: createEventDate(wednesday, 8, 0), userId: 'user-2' },
  ],
  'user-3': [
    { id: 'e3-1', title: 'Zajęcia', start: createEventDate(monday, 13, 15), end: createEventDate(monday, 15, 0), userId: 'user-3' },
    { id: 'e3-2', title: 'Zajęcia', start: createEventDate(friday, 11, 15), end: createEventDate(friday, 13, 0), userId: 'user-3' },
    { id: 'e3-3', title: 'Zajęcia', start: createEventDate(tuesday, 11, 15), end: createEventDate(tuesday, 13, 0), userId: 'user-3' },
    { id: 'e3-4', title: 'Zajęcia', start: createEventDate(thursday, 11, 15), end: createEventDate(thursday, 13, 0), userId: 'user-3' },
    { id: 'e3-5', title: 'Zajęcia', start: createEventDate(wednesday, 11, 15), end: createEventDate(wednesday, 13, 0), userId: 'user-3' },
  ]
};