import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalesOrder, CreateSalesOrderRequest } from '../models/sales-order.model';

@Injectable({ providedIn: 'root' })
export class SalesOrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/salesorders`;

  getAll(): Observable<SalesOrder[]> { return this.http.get<SalesOrder[]>(this.apiUrl); }
  getById(id: string): Observable<SalesOrder> { return this.http.get<SalesOrder>(`${this.apiUrl}/${id}`); }
  create(request: CreateSalesOrderRequest): Observable<SalesOrder> { return this.http.post<SalesOrder>(this.apiUrl, request); }
  submit(id: string): Observable<SalesOrder> { return this.http.post<SalesOrder>(`${this.apiUrl}/${id}/submit`, {}); }
  approve(id: string): Observable<SalesOrder> { return this.http.post<SalesOrder>(`${this.apiUrl}/${id}/approve`, {}); }
  ship(id: string): Observable<SalesOrder> { return this.http.post<SalesOrder>(`${this.apiUrl}/${id}/ship`, {}); }
  deliver(id: string): Observable<SalesOrder> { return this.http.post<SalesOrder>(`${this.apiUrl}/${id}/deliver`, {}); }
  cancel(id: string): Observable<SalesOrder> { return this.http.post<SalesOrder>(`${this.apiUrl}/${id}/cancel`, {}); }
}
