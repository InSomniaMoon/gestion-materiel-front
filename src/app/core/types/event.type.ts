import { Item, ItemWithQuantity } from './item.type';
import { Structure } from './structure.type';

export type Event = {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  name: string;
  status: 'active' | 'inactive';
  structure: Structure;
  structureId: number;
  items: Item[];
  comment: string | null;
};

export type ActualEvent = Event & {
  items: ItemWithQuantity[];
};
