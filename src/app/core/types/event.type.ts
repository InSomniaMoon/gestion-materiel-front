import { Item, ItemWithQuantity } from './item.type';
import { Structure } from './structure.type';

export type Event = {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  name: string;
  status: 'active' | 'inactive';
  structure: Structure;
  structure_id: number;
  items: Item[];
  comment: string | null;
};

export type ActualEvent = Event & {
  event_subscriptions: ItemWithQuantity[];
};
