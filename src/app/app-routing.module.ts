import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeScene } from './home';
import { PropertiesScene } from '../examples/properties';
import { CustomPropertiesScene } from '../examples/custom-properties';
import { LabelPerformanceScene } from '../examples/label-performance';

export const routes: Routes = [
  { path: '', component: HomeScene },
  { path: 'properties', title: 'Properties', component: PropertiesScene },
  { path: 'customproperties', title: 'Custom Properties', component: CustomPropertiesScene },
  { path: 'labelperformance', title: 'Label Performance', component: LabelPerformanceScene },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
