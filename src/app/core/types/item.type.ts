import { ItemOption } from './itemOption.type';
import { Structure } from './structure.type';

export type Item = {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: ItemCategory;
  usable: boolean;
  stock?: number;
  usableStock?: number;
  dateOfBuy?: Date;
  options?: ItemOption[];
  image?: string;
  structureId: number;
  structure?: Structure;
  state?: 'OK' | 'NOK' | 'KO' | 'UNKNOWN';
};

export type ItemWithQuantity = Item & { quantity: number; rest: number };

export type ItemCategory = {
  id: number;
  name: string;
  structureId: number;
  identified: boolean;
};
