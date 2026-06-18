import { StructureWithRole } from './structure.type';

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | string;
};

export type UserWithStructures = User & {
  structures: StructureWithRole[];
};
