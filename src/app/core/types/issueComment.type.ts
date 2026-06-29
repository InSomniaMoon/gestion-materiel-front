// {
//   "id": 1,
//   "item_option_issue_id": 1,
//   "comment": "pied command\u00e9",
//   "user_id": 1,
//   "createdAt": "2024-11-07T21:44:03.000000Z",
//   "author": {
//       "id": 1,
//       "firstName": "Pierre",
//       "lastName": "Leroyer"
//   }

import { User } from './user.type';

// }
export type IssueComment = {
  id: number;
  itemOptionIssueId: number;
  comment: string;
  userId: number;
  createdAt: Date;
  author: Partial<User>;
};
