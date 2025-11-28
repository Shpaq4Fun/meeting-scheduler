export interface User {
  id: string;
  name: string;
  color: string;
  calendarId: string[];
  invitationCalId?: string;
  active?: boolean;
}

export interface CalendarEvent {
  id:string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  description?: string;
  location?: string;
}

export interface SuggestedSlot {
  startTime: string;
  endTime: string;
  reason?: string;
  includeGoogleMeet?: boolean;
  message?: string;
}

export interface Point {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  clusterId: number; // -1 for noise, 0 for unclassified, 1+ for clusters
  alpha: number; // Current opacity (0-1)
  targetAlpha: number; // Target opacity to fade towards
  size: number; // Current size
  targetSize: number; // Target size to scale towards
}
