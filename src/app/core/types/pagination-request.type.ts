export interface PaginationRequest {
  page: number;
  size: number;
  orderBy: string;
  sortBy: SortBy;
  q: string;
}

export type SortBy = 'asc' | 'desc';
