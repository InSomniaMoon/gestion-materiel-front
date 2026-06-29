export type ImportStructureRowError = {
  row: number;
  codeStructure: string;
  message: string;
};

export type ImportStructuresResult = {
  totalRows: number;
  createdCount: number;
  skippedExistingCount: number;
  errors: ImportStructureRowError[];
};
