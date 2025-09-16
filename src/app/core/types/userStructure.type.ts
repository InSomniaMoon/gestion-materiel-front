import { Structure } from './structure.type';
import { User } from './user.type';

export type UserGroup = {
  user_id: number;
  structure_id: number;
  role: 'string';
  user?: User;
  structure?: Structure;
};
