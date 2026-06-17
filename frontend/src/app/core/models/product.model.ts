export type UnitOfMeasure =
  | 'Piece' | 'Kilogram' | 'Gram' | 'Litre' | 'Millilitre'
  | 'Metre' | 'Box' | 'Carton' | 'Pallet';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  barcode: string | null;
  categoryId: string;
  categoryName: string;
  supplierId: string | null;
  supplierName: string | null;
  costAmount: number;
  costCurrency: string;
  sellingAmount: number;
  sellingCurrency: string;
  unit: UnitOfMeasure;
  reorderLevel: number;
  currentStock: number;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  categoryId: string;
  costAmount: number;
  sellingAmount: number;
  unit: UnitOfMeasure;
  reorderLevel: number;
  description?: string;
  barcode?: string;
  supplierId?: string;
  currency?: string;
}

export interface UpdateProductRequest {
  name: string;
  categoryId: string;
  costAmount: number;
  sellingAmount: number;
  unit: UnitOfMeasure;
  reorderLevel: number;
  description?: string;
  barcode?: string;
  supplierId?: string;
  currency?: string;
}
