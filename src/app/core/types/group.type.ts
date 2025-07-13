export type Group = {
  id: number;
  name: string;
  description: string;
};

export type GroupWithPivot = Group & {
  pivot: {
    role: string;
  };
};
