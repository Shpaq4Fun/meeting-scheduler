import type { User, CalendarEvent } from './types';
export const CLIENT_ID = "447637794753-1cs7vg1tigb7abguco0caulb7v64mk3m.apps.googleusercontent.com"
// export const CLIENT_ID = import.meta.env.CLIENT_ID;
// TODO: Add your API key
export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const SCOPES = "https://www.googleapis.com/auth/calendar";

export const USERS: User[] = [
  { id: 'user-0', name: 'DMC Calendar', color: 'bg-gray-700', calendarId: ["c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com","sss"], 
    invitationCalId: 'c_8h6bnbm5se6ha0s6kol29fpeuk@group.calendar.google.com', active: true},
  { id: 'user-1', name: 'Radosław Zimroz', color: 'bg-pink-500', calendarId: ['radoslaw.zimroz@pwr.edu.pl'], 
    invitationCalId: 'radoslaw.zimroz@pwr.edu.pl', active: false },
  { id: 'user-2', name: 'Jacek Wodecki', color: 'bg-blue-900', calendarId: ['jacek.wodecki@pwr.edu.pl'], 
    invitationCalId: 'jacek.wodecki@pwr.edu.pl', active: true },
  { id: 'user-3', name: 'Anna Michalak', color: 'bg-red-900', calendarId: ['3r9m1o50jckmdoop21tcvc4cs7jsguhu@import.calendar.google.com'], 
    invitationCalId: 'anna.michalak@pwr.edu.pl', active: true },
  { id: 'user-4', name: 'Justyna Hebda-Sobkowicz', color: 'bg-green-900', calendarId: ['qp4gg6qfk33p6281n3d4hpa1vos60pt6@import.calendar.google.com'], 
    invitationCalId: 'justyna.hebda-sobkowicz@pwr.edu.pl', active: true },
  { id: 'user-5', name: 'Daniel Kuzio', color: 'bg-cyan-900', calendarId: ['daniel.kuzio@pwr.edu.pl'], 
    invitationCalId: 'daniel.kuzio@pwr.edu.pl', active: false },
  { id: 'user-6', name: 'Michalina Kotyla', color: 'bg-indigo-900', calendarId: ['68gsmg62brvod21otul0qtmbthmjea7v@import.calendar.google.com'], 
    invitationCalId: 'michalina.kotyla@pwr.edu.pl', active: true },
  { id: 'user-7', name: 'Govind Vashishtha', color: 'bg-pink-900', calendarId: ['urd2ejo1prj2ofptfbvcmq9am5hr38hr@import.calendar.google.com'] , 
    invitationCalId: 'govind.vashishtha@pwr.edu.pl', active: true },
  { id: 'user-8', name: 'Sumika Chauhan', color: 'bg-purple-700', calendarId: ['sumika.sumika@pwr.edu.pl'], 
    invitationCalId: 'sumika.sumika@pwr.edu.pl', active: false },
  { id: 'user-9', name: 'Magdalena Worsa-Kozak', color: 'bg-teal-900', calendarId: ['magdalena.worsa-kozak@pwr.edu.pl'], 
    invitationCalId: 'magdalena.worsa-kozak@pwr.edu.pl', active: false },
  { id: 'user-10', name: 'Krzysztof Chudy', color: 'bg-cyan-500', calendarId: ['er9he18v7dp1mr61lvguvi9u1asd91uf@import.calendar.google.com'], 
    invitationCalId: 'krzysztof.chudy@pwr.edu.pl', active: true },
  { id: 'user-11', name: 'Aleksandra Banasiewicz', color: 'bg-pink-500', calendarId: ['hckb9hmhmunet207pr5cdlugl3k5qqb0@import.calendar.google.com'] , 
    invitationCalId: 'aleksandra.banasiewicz@pwr.edu.pl', active: true },
  { id: 'user-12', name: 'Adam Wróblewski', color: 'bg-pink-700', calendarId: ['36r52fb6iubje3kaicjmtk8vahah990g@import.calendar.google.com'], 
    invitationCalId: 'adam.wroblewski@pwr.edu.pl', active: true },
  { id: 'user-13', name: 'Magdalena Sitarska', color: 'bg-pink-900', calendarId: ['magdalena.sitarska@pwr.edu.pl'], 
    invitationCalId: 'magdalena.sitarska@pwr.edu.pl', active: false },
  { id: 'user-14', name: 'Kinga Romańczukiewicz', color: 'bg-teal-700', calendarId: ['6p7prpdf8c9sn8b2sj52pj91nh0dorvd@import.calendar.google.com'], 
    invitationCalId: 'kinga.romanczukiewicz@pwr.edu.pl', active: true },
  { id: 'user-15', name: 'Kamil Gromnicki', color: 'bg-purple-500', calendarId: ['kamil.gromnicki@pwr.edu.pl'], 
    invitationCalId: 'kamil.gromnicki@pwr.edu.pl', active: false },
  { id: 'user-16', name: 'Pavlo Krot', color: 'bg-cyan-700', calendarId: ['pavlo.krot@pwr.edu.pl'], 
    invitationCalId: 'pavlo.krot@pwr.edu.pl', active: false },
  { id: 'user-17', name: 'Przemysław Dąbek', color: 'bg-yellow-900', calendarId: ['nk2v2264olhccmhp9bj7omqc8jkq2p84@import.calendar.google.com'], 
    invitationCalId: 'przemyslaw.dabek@pwr.edu.pl', active: true },
  { id: 'user-18', name: 'Arkadiusz Macek', color: 'bg-indigo-500', calendarId: ['17je74irjiprf8gtninq5d3e1e9h7fjd@import.calendar.google.com'], 
    invitationCalId: 'arkadiusz.macek@pwr.edu.pl', active: true },
];
