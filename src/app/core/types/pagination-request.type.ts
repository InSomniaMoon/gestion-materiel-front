export interface PaginationRequest {
  page: number;
  size: number;
  orderBy: string;
  orderDir: OrderDir;
  q: string;
}

export type OrderDir = 'asc' | 'desc';
