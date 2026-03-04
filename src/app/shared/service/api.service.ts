import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    status: number;
}

export interface RequestOptions {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
    reportProgress?: boolean;
    withCredentials?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private baseUrl: string = 'http://localhost:3000/api';

    constructor(private readonly http: HttpClient) {
        // Default base URL
    }

    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    get<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        return this.http.get<T>(url, options).pipe(
            map((data) => ({data, status: 200})),
            catchError(this.handleError)
        );
    }

    post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        return this.http.post<T>(url, body, options).pipe(
            map((data) => ({data, status: 201})),
            catchError(this.handleError)
        );
    }

    put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        return this.http.put<T>(url, body, options).pipe(
            map((data) => ({data, status: 200})),
            catchError(this.handleError)
        );
    }

    patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        return this.http.patch<T>(url, body, options).pipe(
            map((data) => ({data, status: 200})),
            catchError(this.handleError)
        );
    }

    delete<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        return this.http.delete<T>(url, options).pipe(
            map(() => ({status: 204})),
            catchError(this.handleError)
        );
    }

    // Convenience methods for common operations
    getOne<T>(endpoint: string, id: string | number, options?: RequestOptions): Observable<ApiResponse<T>> {
        return this.get<T>(`${endpoint}/${id}`, options);
    }

    create<T>(endpoint: string, item: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        return this.post<T>(endpoint, item, options);
    }

    update<T>(endpoint: string, id: string | number, item: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        return this.put<T>(`${endpoint}/${id}`, item, options);
    }

    remove<T>(endpoint: string, id: string | number, options?: RequestOptions): Observable<ApiResponse<T>> {
        return this.delete<T>(`${endpoint}/${id}`, options);
    }

    // File upload
    upload<T>(endpoint: string, file: File, additionalData?: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });
        }

        const uploadOptions: RequestOptions = {
            ...options,
            headers: {
                'Accept': 'application/json'
                // Don't set Content-Type header for FormData - browser will set it with boundary
            }
        };

        return this.post<T>(endpoint, formData, uploadOptions);
    }

    // Build query parameters from object
    buildParams(params: { [key: string]: any }): HttpParams {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '') {
                httpParams = httpParams.set(key, value.toString());
            }
        });
        return httpParams;
    }

    // Build headers with common defaults
    buildHeaders(customHeaders?: { [key: string]: string }): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });

        if (customHeaders) {
            Object.keys(customHeaders).forEach(key => {
                headers = headers.set(key, customHeaders[key]);
            });
        }

        return headers;
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
        }

        return throwError(() => errorMessage);
    }
}
