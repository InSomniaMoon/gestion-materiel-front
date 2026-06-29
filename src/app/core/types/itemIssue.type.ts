// {
//   "id": 1,
//   "item_option_id": 1,
//   "value": "chaise cass\u00e9e",
//   "created_at": "2024-11-07T13:16:00.000000Z",
//   "status": "open"
//  }

import { Item } from './item.type';
import { User } from './user.type';

export type ItemIssue = {
  id: number;
  itemId: number;
  value: string;
  createdAt: Date;
  status: string;
  reportedBy?: User;
};

export type AdminDashboardItemIssue = ItemIssue & {
  item?: Item;
};
