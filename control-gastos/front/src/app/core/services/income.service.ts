import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateIncomePayload, Income, IncomeSummary, UpdateIncomePayload } from '../models/income.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Habla con /api/incomes. El interceptor ya adjunta el Bearer token,
 * así que aquí no hace falta preocuparse por eso.
 */
@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly apiUrl = `${environment.apiUrl}/incomes`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResponse<IncomeSummary>> {
    return this.http.get<ApiResponse<IncomeSummary>>(this.apiUrl);
  }

  create(payload: CreateIncomePayload): Observable<ApiResponse<Income>> {
    return this.http.post<ApiResponse<Income>>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateIncomePayload): Observable<ApiResponse<Income>> {
    return this.http.put<ApiResponse<Income>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}