import { User } from './user.type';

export type Structure = {
  id: number;
  codeStructure: string;
  nomStructure: string;
  type: 'NATIONAL' | 'TERRITOIRE' | 'GROUPE' | 'UNITE';
  name: string;
  description?: string;
  image?: string;
  color?: string;
  members?: User[];
};

export type StructureWithRole = Structure & {
  role: string;
};

export type StructureWithChildren = {
  structure: Structure;
  children: Structure[];
};
