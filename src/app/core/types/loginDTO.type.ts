import { StructureWithPivot } from './structure.type';
import { User } from './user.type';

export type LoginDTO = {
  token: string;
  refresh_token: string;
  user: User;
  structures: StructureWithPivot[];
};
