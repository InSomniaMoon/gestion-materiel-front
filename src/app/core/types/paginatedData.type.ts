// {
//   current_page:1
// data: [{id: 2, name: "Salle 10 places", description: "Salle 10 places", category: "salle", usable: true,…},…]
// first_page_url: "/items?page=1&size=25&order_by=name&=1"
// from: 1
// next_page_url: null
// path: "/items"
// per_page: "25"
// prev_page_url: null
// to: 6
// }
export type PaginatedData<T> = {
  data: T[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  to: number;
  from: number;
};

export const EMPTY_PAGINATED_DATA: PaginatedData<any> = {
  data: [],
  total: 0,
  perPage: 0,
  currentPage: 0,
  lastPage: 0,
  to: 0,
  from: 0,
};
