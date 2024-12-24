import { Group } from './group.type';
import { User } from './user.type';

export type UserGroup = {
  user_id: number;
  group_id: number;
  role: 'string';
  user?: User;
  group?: Group;
};
