import { ItemCategory } from './item.type';

export type ImportPreviewRowStatus = 'matched' | 'unknown' | 'invalid';

export type ImportPreviewRowError = 'quantity_required';

export type ImportPreviewRow = {
  row: number;
  item_name: string;
  description: string;
  category_name: string;
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
  structure_id: number;
  items_count: number;
  rows: ImportPreviewRow[];
  unknown_categories: UnknownImportCategory[];
  existing_categories: Pick<ItemCategory, 'id' | 'name' | 'identified'>[];
};

export type ImportCategoryResolution =
  | {
      action: 'create';
      name: string;
      identified: boolean;
    }
  | {
      action: 'existing';
      category_id: number | null;
    };

export type BulkImportResult = {
  imported_count: number;
  created_categories: Pick<ItemCategory, 'id' | 'name' | 'identified'>[];
};
