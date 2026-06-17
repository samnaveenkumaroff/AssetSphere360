export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
}

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalStockValue: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}
