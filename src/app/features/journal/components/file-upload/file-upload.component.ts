import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FileUploadService } from '../../services/file-upload.service';

export interface FileMetadata {
  'file-type': 'CSV' | 'EXCEL' | 'JSON';
  'source-system': string;
  description: string;
  'file-category': 'TRADE_BOOK' | 'PORTFOLIO' | 'REPORTS' | 'OTHER';
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() uploadSuccess = new EventEmitter<void>();

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    private messageService: MessageService
  ) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required],
      fileType: ['CSV', Validators.required],
      fileCategory: ['TRADE_BOOK', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadForm.patchValue({ file: this.selectedFile });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;

    const metadata: FileMetadata = {
      'file-type': this.uploadForm.value.fileType,
      'source-system': 'USER_INTERFACE', // Managed by system
      description: this.uploadForm.value.description,
      'file-category': this.uploadForm.value.fileCategory
    };

    this.fileUploadService.uploadFile(this.selectedFile, metadata).subscribe({
      next: (response) => {
        this.isUploading = false;
        console.log('Upload successful:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: 'Your file has been uploaded and processed completely.'
        });

        setTimeout(() => {
          this.uploadSuccess.emit();
          this.resetForm();
        }, 1500);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: error.message || 'Upload failed. Please try again.'
        });
      }
    });
  }

  resetForm(): void {
    this.uploadForm.reset({
      fileType: 'CSV',
      fileCategory: 'TRADE_BOOK',
      description: ''
    });
    this.selectedFile = null;
  }

  get fileName(): string {
    return this.selectedFile?.name || '';
  }

  get fileSize(): string {
    if (!this.selectedFile) return '';

    const size = this.selectedFile.size;
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}
