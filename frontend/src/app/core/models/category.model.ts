export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  productCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
}
