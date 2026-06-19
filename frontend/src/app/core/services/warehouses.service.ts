import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Warehouse, CreateWarehouseRequest } from '../models/stock-movement.model';

@Injectable({ providedIn: 'root' })
export class WarehousesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/warehouses`;

  getAll(): Observable<Warehouse[]> { return this.http.get<Warehouse[]>(this.apiUrl); }
  create(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, request);
  }
}
