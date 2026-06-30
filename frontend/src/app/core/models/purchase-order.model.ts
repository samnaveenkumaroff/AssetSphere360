export type OrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  currency: string;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate: string | null;
  receivedDate: string | null;
  notes: string | null;
  totalAmount: number;
  currency: string;
  lines: PurchaseOrderLine[];
}

export interface CreatePurchaseOrderLineRequest {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  lines: CreatePurchaseOrderLineRequest[];
}
