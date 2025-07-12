// {
//         "id": 1,
//         "group_id": 1,
//         "responsible_id": null,
//         "name": "dzzefdzef",
//         "color": "#000000",
//         "created_at": "2025-07-11T18:37:35.000000Z",
//         "updated_at": "2025-07-11T18:37:35.000000Z"
//     }
export interface Unit {
  id: number;
  group_id: number;
  responsible_id?: number | null;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}
