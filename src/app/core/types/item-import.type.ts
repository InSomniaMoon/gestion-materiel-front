import { ItemCategory } from './item.type';

export type ImportPreviewRowStatus = 'matched' | 'unknown' | 'invalid';

export type ImportPreviewRowError = 'quantity_required';

export type ImportPreviewRow = {
  row: number;
  itemName: string;
  description: string;
  categoryName: string;
  quantity: number | null;
  status: ImportPreviewRowStatus;
  errors: ImportPreviewRowError[];
  category: Pick<ItemCategory, 'id' | 'name' | 'identified'> | null;
};

export type UnknownImportCategory = {
  name: string;
  occurrences: number;
};

export type BulkImportPreview = {
  structureId: number;
  itemsCount: number;
  rows: ImportPreviewRow[];
  unknownCategories: UnknownImportCategory[];
  existingCategories: Pick<ItemCategory, 'id' | 'name' | 'identified'>[];
};

export type ImportCategoryResolution =
  | {
      action: 'create';
      name: string;
      identified: boolean;
    }
  | {
      action: 'existing';
      categoryId: number | null;
    };

export type BulkImportResult = {
  importedCount: number;
  createdCategories: Pick<ItemCategory, 'id' | 'name' | 'identified'>[];
};
