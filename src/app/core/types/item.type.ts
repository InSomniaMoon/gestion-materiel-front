// {
//   "id": 1,
//   "name": "Salle 10 places",
//   "description": "Salle 10 places",
//   "category": "salle",
//   "usable": true

import { ItemOption } from './itemOption.type';

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
};

export type ItemCategory = {
  id: number;
  name: string;
  group_id: number;
  identified: boolean;
};
