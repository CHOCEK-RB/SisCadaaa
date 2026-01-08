import { api, type RequestOptions } from "./api.service";

export enum EventType {
  ACADEMIC = "academic",
  GRADING = "grading",
  LAB_ENROLLMENT = "lab_enrollment",
}

export interface GlobalEvent {
  id: string;
  name: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface CreateGlobalEventDto {
  name: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface UpdateGlobalEventDto {
  name?: string;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

class EventService {
  private baseEndpoint = "/events";

  async getAllEvents(requestOptions?: RequestOptions): Promise<GlobalEvent[]> {
    return api.get<GlobalEvent[]>(this.baseEndpoint, requestOptions);
  }

  async getEventById(
    id: string,
    requestOptions?: RequestOptions,
  ): Promise<GlobalEvent | null> {
    return api.get<GlobalEvent>(`${this.baseEndpoint}/${id}`, requestOptions);
  }

  async createEvent(
    event: CreateGlobalEventDto,
    requestOptions?: RequestOptions,
  ): Promise<GlobalEvent> {
    return api.post<GlobalEvent>(this.baseEndpoint, event, requestOptions);
  }

  async updateEvent(
    id: string,
    event: UpdateGlobalEventDto,
    requestOptions?: RequestOptions,
  ): Promise<GlobalEvent> {
    return api.patch<GlobalEvent>(
      `${this.baseEndpoint}/${id}`,
      event,
      requestOptions,
    );
  }

  async deleteEvent(
    id: string,
    requestOptions?: RequestOptions,
  ): Promise<void> {
    return api.delete<void>(`${this.baseEndpoint}/${id}`, requestOptions);
  }
}

export const eventService = new EventService();
