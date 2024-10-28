import { CalendarEvent } from 'angular-calendar';
import { Subscription } from '../types/subscription.type';

export class CalendarEventAdapter {
  static adapt(subscription: Subscription): CalendarEvent {
    return {
      start: new Date(subscription.start_date),
      end: new Date(subscription.end_date),
      title: subscription.name,
      id: subscription.id,
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    };
  }
}
