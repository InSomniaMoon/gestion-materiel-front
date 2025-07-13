// {
//   "id": 1,
//   "name": "Salle 10 places",
//   "description": "Salle 10 places",
//   "category": "salle",
//   "usable": true

// },
export type Item = {
  id: number;
  name: string;
  description?: string;
  category?: ItemCategory;
  category_id: number;
  usable: boolean;
};

export type ItemCategory = {
  id: number;
  name: string;
};
