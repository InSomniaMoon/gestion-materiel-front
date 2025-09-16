import { User } from './user.type';

export type Structure = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  color?: string;
  members?: User[];
};

export type StructureWithPivot = Structure & {
  pivot: {
    structure_id?: number;
    role: string;
  };
};

export type StructureWithChildren = Structure & {
  children: Structure[];
};
