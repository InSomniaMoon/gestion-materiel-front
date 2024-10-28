import { User } from './user.type';

export type LoginDTO = {
  token: string;
  user: User;
};
