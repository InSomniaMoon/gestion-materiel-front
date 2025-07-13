import { GroupWithPivot } from './group.type';
import { Unit } from './unit.type';
import { User } from './user.type';

export type LoginDTO = {
  token: string;
  refresh_token: string;
  user: User;
  groups: GroupWithPivot[];
  units: Unit[];
};
