# File Upload Modal Test

## How to Test the Upload Feature

1. **Navigate to Trade Journal**: Open the application and go to `/journal`

2. **Click Upload Button**: Click the "Upload File" button in the header (next to "Log Trade")

3. **Verify Modal Opens**: The upload modal should appear with:
   - Title "Upload Trade File"
   - Close button (×) in the top right
   - File upload form with fields for:
     - File selection (accepts .csv, .xlsx, .xls, .json)
     - File Type (CSV, Excel, JSON)
     - Source System (default: UI)
     - Description
     - File Category (Trade Book, Portfolio, Reports, Other)

4. **Test File Selection**: 
   - Click "Choose File" and select a CSV file
   - Verify file info appears (name and size)

5. **Test Form Validation**:
   - Try submitting without a file - should show validation errors
   - Try submitting without description - should show validation errors

6. **Test Upload** (requires backend running at localhost:8085):
   - Fill in all required fields
   - Click "Upload File"
   - Should show loading state
   - On success, should show success message and close modal after 2 seconds
   - On error, should show error message

7. **Test Modal Close**:
   - Click the × button to close
   - Click outside the modal to close
   - After successful upload, modal should auto-close

## API Endpoint

The upload component sends POST requests to:
```
POST http://localhost:8085/api/v1/file/upload
Content-Type: multipart/form-data

Form Data:
- file: [selected file]
- file-metadata: [JSON string with fileType, sourceSystem, description, fileCategory]
```

## Styling

The modal matches the application's theme:
- Uses DM Sans font
- Green primary buttons (#2D6A4F)
- Consistent border colors (#E8E4DC)
- Proper spacing and shadows
- Responsive design
