export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string | ('admin' | 'user');
};
