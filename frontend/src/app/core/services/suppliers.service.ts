import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier, CreateSupplierRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  getAll(): Observable<Supplier[]> { return this.http.get<Supplier[]>(this.apiUrl); }
  getById(id: string): Observable<Supplier> { return this.http.get<Supplier>(`${this.apiUrl}/${id}`); }
  create(request: CreateSupplierRequest): Observable<Supplier> { return this.http.post<Supplier>(this.apiUrl, request); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
