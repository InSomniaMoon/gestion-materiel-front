import { Item } from './item.type';

export type Event = {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  name: string;
  status: 'active' | 'inactive';
  unit_id: number;
  items: Item[];
};

export type ActualEvent = Event & {
  event_subscriptions: Item[];
};
