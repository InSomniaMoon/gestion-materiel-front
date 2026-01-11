import { ItemOption } from './itemOption.type';
import { Structure } from './structure.type';

export type Item = {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  usable: boolean;
  stock?: number;
  usable_stock?: number;
  date_of_buy?: Date;
  category?: ItemCategory;
  options?: ItemOption[];
  image?: string;
  structure_id: number;
  structure?: Structure;
  state?: 'OK' | 'NOK' | 'KO' | 'UNKNOWN';
};

export type ItemWithQuantity = Item & { quantity: number; rest: number };

export type ItemCategory = {
  id: number;
  name: string;
  structure_id: number;
  identified: boolean;
};
