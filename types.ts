export interface User {
  id: string;
  name: string;
  color: string;
  calendarId: string;
  invitationCalId?: string;
  active?: boolean;
}

export interface CalendarEvent {
  id:string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  location?: string;
  description?: string;
}

export interface SuggestedSlot {
  startTime: string;
  endTime: string;
  reason?: string;
}
