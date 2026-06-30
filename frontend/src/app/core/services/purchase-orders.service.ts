import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchaseOrder, CreatePurchaseOrderRequest } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchaseorders`;

  getAll(): Observable<PurchaseOrder[]> { return this.http.get<PurchaseOrder[]>(this.apiUrl); }
  getById(id: string): Observable<PurchaseOrder> { return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`); }
  create(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(this.apiUrl, request); }
  submit(id: string): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/submit`, {}); }
  approve(id: string): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/approve`, {}); }
  receive(id: string): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, {}); }
  cancel(id: string): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, {}); }
}
