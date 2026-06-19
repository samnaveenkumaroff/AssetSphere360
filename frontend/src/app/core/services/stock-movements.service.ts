import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockMovement, CreateStockMovementRequest } from '../models/stock-movement.model';

@Injectable({ providedIn: 'root' })
export class StockMovementsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/stockmovements`;

  getAll(): Observable<StockMovement[]> { return this.http.get<StockMovement[]>(this.apiUrl); }
  getByProduct(productId: string): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/product/${productId}`);
  }
  create(request: CreateStockMovementRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.apiUrl, request);
  }
}
