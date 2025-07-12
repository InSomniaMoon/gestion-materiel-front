export interface PaginationRequest {
  page: number;
  size: number;
  order_by: string;
  sort_by: string;
  q: string;
}
