import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FileUpload} from './components/file-upload/file-upload';

const routes: Routes = [
  {
    path: 'file-upload',
    component: FileUpload,
    outlet: 'primary'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngestionRoutingModule { }
