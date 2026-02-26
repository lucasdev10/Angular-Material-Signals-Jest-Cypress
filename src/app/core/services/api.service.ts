import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Opções para requisições HTTP
 */
export interface IApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | string[]>;
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * Serviço abstrato para requisições HTTP
 * Facilita migração de mock para API real
 *
 * Quando migrar para API real:
 * 1. Mude environment.enableMocks para false
 * 2. Configure environment.apiUrl
 * 3. Repositories automaticamente usarão API real
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: IApiRequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options);
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown, options?: IApiRequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown, options?: IApiRequestOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown, options?: IApiRequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: IApiRequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options);
  }

  /**
   * Upload de arquivo
   */
  upload<T>(endpoint: string, file: File, additionalData?: Record<string, unknown>): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      reportProgress: true,
    });
  }

  /**
   * Download de arquivo
   */
  download(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob',
    });
  }
}
