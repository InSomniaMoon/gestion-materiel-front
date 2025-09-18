import { User } from './user.type';

export type Structure = {
  id: number;
  code_structure: string;
  type: 'NATIONAL' | 'TERRITOIRE' | 'GROUPE' | 'UNITE';
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

export type StructureWithChildren = {
  structure: Structure;
  children: Structure[];
};
