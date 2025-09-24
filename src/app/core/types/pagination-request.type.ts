export interface PaginationRequest {
  page: number;
  size: number;
  order_by: string;
  sort_by: SortBy;
  q: string;
}

export type SortBy = 'asc' | 'desc';
