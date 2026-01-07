export enum EventType {
  ACADEMIC = 'academic',
  GRADING = 'grading',
  LAB_ENROLLMENT = 'lab_enrollment',
}

export interface GlobalEvent {
  id: string;
  name: string;
  type: EventType;
  startDate: string; // Dates will be strings in JSON
  endDate: string;
  isActive: boolean;
}
