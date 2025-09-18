// {
//   "id": 1,
//   "name": "Salle 10 places",
//   "description": "Salle 10 places",
//   "category": "salle",
//   "usable": true

import { ItemOption } from './itemOption.type';
import { Structure } from './structure.type';

// },
export type Item = {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  usable: boolean;
  stock?: number;
  date_of_buy?: Date;
  category?: ItemCategory;
  options?: ItemOption[];
  image?: string;
  structure_id: number;
  structure?: Structure;
};

export type ItemWithQuantity = Item & { quantity: number; rest: number };

export type ItemCategory = {
  id: number;
  name: string;
  structure_id: number;
  identified: boolean;
};
