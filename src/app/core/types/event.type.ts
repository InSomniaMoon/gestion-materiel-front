import { Item } from './item.type';
import { Unit } from './unit.type';

export type Event = {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  name: string;
  status: 'active' | 'inactive';
  unit: Unit;
  unit_id: number;
  items: Item[];
  comment: string | null;
};

export type ActualEvent = Event & {
  event_subscriptions: Item[];
};
