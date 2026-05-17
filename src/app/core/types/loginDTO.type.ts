import { StructureWithRole } from './structure.type';
import { User } from './user.type';

export type LoginDTO = {
  token: string;
  refreshToken: string;
  user: User;
  structures: StructureWithRole[];
};
