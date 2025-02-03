import { User } from './user.type';
import { UserGroup } from './userGroup.type';

export type LoginDTO = {
  token: string;
  refresh_token: string;
  user: User;
  groups: UserGroup[];
};
