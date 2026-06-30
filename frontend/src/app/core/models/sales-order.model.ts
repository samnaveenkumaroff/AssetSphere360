import { OrderStatus } from './purchase-order.model';

export interface SalesOrderLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  warehouseId: string;
  warehouseName: string;
  status: OrderStatus;
  orderDate: string;
  shippedDate: string | null;
  deliveredDate: string | null;
  notes: string | null;
  totalAmount: number;
  currency: string;
  lines: SalesOrderLine[];
}

export interface CreateSalesOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId: string;
  notes?: string;
  lines: CreateSalesOrderLineRequest[];
}
