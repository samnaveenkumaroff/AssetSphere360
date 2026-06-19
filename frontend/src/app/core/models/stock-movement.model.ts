export type MovementType = 'StockIn' | 'StockOut' | 'Adjustment' | 'Transfer' | 'Return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  referenceNumber: string | null;
  notes: string | null;
  movementDate: string;
}

export interface CreateStockMovementRequest {
  productId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  referenceNumber?: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateWarehouseRequest {
  name: string;
  code: string;
}
