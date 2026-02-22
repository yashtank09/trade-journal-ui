import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IngestionRoutingModule} from './ingestion-routing-module';
import {FileUpload} from './components/file-upload/file-upload';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IngestionRoutingModule,
    FileUpload
  ]
})
export class IngestionModule {
}
