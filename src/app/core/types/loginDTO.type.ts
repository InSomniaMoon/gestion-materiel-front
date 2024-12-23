import { Group } from './group.type';
import { User } from './user.type';
import { UserGroup } from './userGroup.type';

export type LoginDTO = {
  token: string;
  user: User;
  groups: UserGroup[];
};
