import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnInit {
    ngOnInit(): void {
        console.log('File Upload');
    }

}
