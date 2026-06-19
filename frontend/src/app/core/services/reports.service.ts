import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  exportProductsExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/products/excel`, { responseType: 'blob' });
  }

  exportProductsPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/products/pdf`, { responseType: 'blob' });
  }

  exportStockMovementsExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/stock-movements/excel`, { responseType: 'blob' });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
