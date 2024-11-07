// {
//   "id": 1,
//   "item_option_issue_id": 1,
//   "comment": "pied command\u00e9",
//   "user_id": 1,
//   "created_at": "2024-11-07T21:44:03.000000Z",
//   "author": {
//       "id": 1,
//       "name": "Pierre Leroyer"
//   }

import { User } from './user.type';

// }
export type IssueComment = {
  id: number;
  item_option_issue_id: number;
  comment: string;
  user_id: number;
  created_at: Date;
  author: Partial<User>;
};
