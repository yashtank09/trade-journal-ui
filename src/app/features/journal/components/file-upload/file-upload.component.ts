import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadService } from '../../services/file-upload.service';

export interface FileMetadata {
  fileType: 'CSV' | 'EXCEL' | 'JSON';
  sourceSystem: string;
  description: string;
  fileCategory: 'TRADE_BOOK' | 'PORTFOLIO' | 'REPORTS' | 'OTHER';
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
  uploadSuccessInternal = false;
  uploadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private fileUploadService: FileUploadService
  ) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required],
      fileType: ['CSV', Validators.required],
      sourceSystem: ['UI', Validators.required],
      description: ['', Validators.required],
      fileCategory: ['TRADE_BOOK', Validators.required]
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadForm.patchValue({ file: this.selectedFile });
      this.uploadError = null;
      this.uploadSuccessInternal = false;
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccessInternal = false;

    const metadata: FileMetadata = {
      fileType: this.uploadForm.value.fileType,
      sourceSystem: this.uploadForm.value.sourceSystem,
      description: this.uploadForm.value.description,
      fileCategory: this.uploadForm.value.fileCategory
    };

    this.fileUploadService.uploadFile(this.selectedFile, metadata).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccessInternal = true;
        this.uploadSuccess.emit();
        setTimeout(() => {
          this.resetForm();
        }, 2000);
        console.log('Upload successful:', response);
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadError = error.message || 'Upload failed. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }

  resetForm(): void {
    this.uploadForm.reset({
      fileType: 'CSV',
      sourceSystem: 'UI',
      description: '',
      fileCategory: 'TRADE_BOOK'
    });
    this.selectedFile = null;
    this.uploadSuccessInternal = false;
    this.uploadError = null;
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
