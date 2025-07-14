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
  image?: string;
  category?: ItemCategory;
  category_id: number;
  usable: boolean;
  date_of_buy?: Date;
  options?: ItemOption[];
};

export type ItemCategory = {
  id: number;
  name: string;
  group_id: number;
};
