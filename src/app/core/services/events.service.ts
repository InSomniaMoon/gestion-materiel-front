import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ActualEvent, Event } from '../types/event.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;

  constructor() {}

  createEvent(data: {
    name: string;
    unit_id: number;
    start_date: Date | null;
    end_date: Date | null;
    materials: { id: number; quantity: number }[];
    comment: string;
  }) {
    const url = `${this.api_url}/events`;
    // This method should return an observable of the created event
    return this.http.post(
      url,
      data,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/events`]))
    );
  }

  getEventsForUnit(unitId: number) {
    const url = `${this.api_url}/events?unit_id=${unitId}`;
    // This method should return an observable of the unit events
    return this.http.get<Event[]>(url);
  }

  getActualEvents() {
    const url = `${this.api_url}/events/actual`;
    // This method should return an observable of the actual events
    return this.http.get<ActualEvent[]>(url);
  }

  getEventById(id: number | string) {
    return this.http.get<Event>(`${this.api_url}/events/${id}`);
  }

  delete(event: Event) {
    return this.http.delete(
      `${this.api_url}/events/${event.id}`,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/events`]))
    );
  }

  updateEvent(id: number | string, data: Partial<Event>) {
    return this.http.patch(
      `${this.api_url}/events/${id}`,
      data,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/events/${id}`]))
    );
  }
}
