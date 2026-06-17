export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string | null;
  isActive: boolean;
  productCount: number;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstNumber?: string;
}
