import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadService } from '../../services/file-upload.service';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let mockFileUploadService: jasmine.SpyObj<FileUploadService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FileUploadService', ['uploadFile']);

    await TestBed.configureTestingModule({
      imports: [FileUploadComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: FileUploadService, useValue: spy }
      ]
    }).compileComponents();

    mockFileUploadService = TestBed.inject(FileUploadService) as jasmine.SpyObj<FileUploadService>;
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.uploadForm).toBeDefined();
    expect(component.uploadForm.get('fileType')?.value).toBe('CSV');
    expect(component.uploadForm.get('sourceSystem')?.value).toBe('UI');
    expect(component.uploadForm.get('fileCategory')?.value).toBe('TRADE_BOOK');
  });

  it('should be invalid when no file is selected', () => {
    expect(component.uploadForm.invalid).toBeTruthy();
  });

  it('should update selected file when file is chosen', () => {
    const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;

    component.onFileSelect(mockEvent);

    expect(component.selectedFile).toBe(mockFile);
    expect(component.fileName).toBe('test.csv');
    expect(component.uploadForm.get('file')?.value).toBe(mockFile);
  });

  it('should reset form correctly', () => {
    // Set some values
    component.selectedFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.uploadForm.patchValue({
      fileType: 'EXCEL',
      sourceSystem: 'API',
      description: 'Test description',
      fileCategory: 'PORTFOLIO'
    });

    component.resetForm();

    expect(component.selectedFile).toBeNull();
    expect(component.uploadForm.get('fileType')?.value).toBe('CSV');
    expect(component.uploadForm.get('sourceSystem')?.value).toBe('UI');
    expect(component.uploadForm.get('description')?.value).toBe('');
    expect(component.uploadForm.get('fileCategory')?.value).toBe('TRADE_BOOK');
  });

  it('should not submit when form is invalid', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    
    component.uploadForm.markAllAsTouched();
    component.onSubmit();

    expect(mockFileUploadService.uploadFile).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = mockFile;
    component.uploadForm.patchValue({
      file: mockFile,
      fileType: 'CSV',
      sourceSystem: 'UI',
      description: 'Test Upload',
      fileCategory: 'TRADE_BOOK'
    });

    mockFileUploadService.uploadFile.and.returnValue({
      subscribe: () => {}
    } as any);

    component.onSubmit();

    expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(mockFile, {
      fileType: 'CSV',
      sourceSystem: 'UI',
      description: 'Test Upload',
      fileCategory: 'TRADE_BOOK'
    });
  });
});
