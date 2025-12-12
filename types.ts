export interface Booking {
  id: number;
  title: string;
  description: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  attendees:Attendee[];
  status: string;
  uid?: string;
}

export interface Attendee {
  name: string;
  email: string;
  timeZone: string;
}

export interface BookingPayload {
  eventTypeId: number;
  start: string; // ISO string
  end?: string; // ISO string
  responses: {
    name: string;
    email: string;
    notes?: string;
    location?: {
      value: string;
      optionValue: string;
    };
  };
  metadata?: Record<string, any>;
  timeZone: string;
  language: string;
}

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  NONE = 'NONE'
}

export interface UserSession {
  role: UserRole;
  name?: string;
  email?: string;
}