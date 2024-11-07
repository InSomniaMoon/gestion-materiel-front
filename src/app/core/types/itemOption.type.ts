// {
//   "id": 1,
//   "item_id": 1,
//   "name": "Chaise",
//   "description": "Chaise",
//   "usable": true

import { OptionIssue } from './optionIssue.type';

// },
export type ItemOption = {
  id: number;
  item_id: number;
  name: string;
  description: string;
  usable: boolean;
  option_issues?: OptionIssue[];
};
