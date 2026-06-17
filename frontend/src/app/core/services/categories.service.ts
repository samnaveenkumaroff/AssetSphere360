import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  getAll(): Observable<Category[]> { return this.http.get<Category[]>(this.apiUrl); }
  getById(id: string): Observable<Category> { return this.http.get<Category>(`${this.apiUrl}/${id}`); }
  create(request: CreateCategoryRequest): Observable<Category> { return this.http.post<Category>(this.apiUrl, request); }
  update(id: string, request: UpdateCategoryRequest): Observable<Category> { return this.http.put<Category>(`${this.apiUrl}/${id}`, request); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
