import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

// Use Angular's built-in types for HTTP options
type RequestOptions = {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
    reportProgress?: boolean;
    withCredentials?: boolean;
};

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly baseUrl: string = environment.apiUrl;

    constructor(private readonly http: HttpClient) {
    }

    private buildUrl(endpoint: string): string {
        // Ensures that we don't have double slashes if endpoint starts with /
        return `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    }

    // --- Core HTTP Methods ---

    get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.http.get<T>(this.buildUrl(endpoint), options);
    }

    post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
        return this.http.post<T>(this.buildUrl(endpoint), body, options);
    }

    put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
        return this.http.put<T>(this.buildUrl(endpoint), body, options);
    }

    patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
        return this.http.patch<T>(this.buildUrl(endpoint), body, options);
    }

    delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.http.delete<T>(this.buildUrl(endpoint), options);
    }

    // --- Convenience Methods for Common CRUD Operations ---

    getOne<T>(endpoint: string, id: string | number, options?: RequestOptions): Observable<T> {
        return this.get<T>(`${endpoint}/${id}`, options);
    }

    create<T>(endpoint: string, item: any, options?: RequestOptions): Observable<T> {
        return this.post<T>(endpoint, item, options);
    }

    update<T>(endpoint: string, id: string | number, item: any, options?: RequestOptions): Observable<T> {
        return this.put<T>(`${endpoint}/${id}`, item, options);
    }

    remove<T>(endpoint: string, id: string | number, options?: RequestOptions): Observable<T> {
        return this.delete<T>(`${endpoint}/${id}`, options);
    }

    // --- Specialized Methods ---

    /**
     * Handles file uploads using FormData.
     */
    upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>, options?: RequestOptions): Observable<T> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        if (additionalData) {
            Object.keys(additionalData).forEach(key => {
                // FormData values are converted to string
                formData.append(key, additionalData[key]);
            });
        }

        // The browser will automatically set the 'Content-Type' header with the correct boundary.
        // We only need to ensure our default JSON content-type is not sent.
        const uploadOptions: RequestOptions = {
            ...options,
            headers: {...options?.headers, 'Accept': 'application/json'}
        };

        return this.post<T>(endpoint, formData, uploadOptions);
    }

    // --- Helper Utilities ---

    /**
     * Builds HttpParams from a plain object, filtering out null/undefined values.
     */
    buildParams(params: Record<string, any>): HttpParams {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '') {
                httpParams = httpParams.set(key, value.toString());
            }
        });
        return httpParams;
    }

    /**
     * Builds HttpHeaders with common defaults.
     */
    buildHeaders(customHeaders?: Record<string, string>): HttpHeaders {
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
}
