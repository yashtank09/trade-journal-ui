import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

export interface FileMetadata {
  fileType: 'CSV' | 'EXCEL' | 'JSON';
  sourceSystem: string;
  description: string;
  fileCategory: 'TRADE_BOOK' | 'PORTFOLIO' | 'REPORTS' | 'OTHER';
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
  processedTrades?: number;
  errors?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly apiUrl = `${environment.apiUrl}/file`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, metadata: FileMetadata): Observable<UploadResponse> {
    const formData = new FormData();
    
    // Append the file
    formData.append('file', file);
    
    // Append metadata as JSON string
    formData.append('file-metadata', JSON.stringify(metadata));

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          // This would be handled by a separate progress method if needed
          return event as any;
        } else if (event.type === HttpEventType.Response) {
          return event.body as UploadResponse;
        }
        return event as any;
      }),
      catchError(this.handleError)
    );
  }

  uploadFileWithProgress(file: File, metadata: FileMetadata): Observable<{
    progress?: UploadProgress;
    response?: UploadResponse;
    complete?: boolean;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file-metadata', JSON.stringify(metadata));

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total || file.size,
            percentage: Math.round((event.loaded * 100) / (event.total || file.size))
          };
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { 
            response: event.body as UploadResponse,
            complete: true 
          };
        }
        return { complete: false };
      }),
      catchError(this.handleError)
    );
  }

  getUploadStatus(fileId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${fileId}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(fileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${fileId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('File upload error:', error);
    
    let errorMessage = 'An error occurred during file upload';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error with status code
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request: Invalid file or metadata';
          break;
        case 413:
          errorMessage = 'File too large';
          break;
        case 415:
          errorMessage = 'Unsupported file type';
          break;
        case 500:
          errorMessage = 'Server error: Please try again later';
          break;
        default:
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
