// {
//   "id": 1,
//   "item_id": 1,
//   "name": "Chaise",
//   "description": "Chaise",
//   "usable": true

import { ItemIssue } from './itemIssue.type';

// },
export type ItemOption = {
  id: number | null;
  item_id: number | null;
  name: string;
  description?: string;
  usable: boolean;
  option_issues?: ItemIssue[];
};
