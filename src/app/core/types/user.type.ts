export type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  role: string | ('admin' | 'user');
};
