export type Group = {
  id: number;
  name: string;
  description?: string;
  image?: string;
};

export type GroupWithPivot = Group & {
  pivot: {
    group_id?: number;
    role: string;
  };
};
