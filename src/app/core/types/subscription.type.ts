export type Subscription = {
  id: number;
  item_id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  name: string;
  status: 'active' | 'inactive';
  unit_id: number;
};
