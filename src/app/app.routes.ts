import { Routes } from '@angular/router';
import { VaccineApp } from './features/vaccine-app';

export const routes: Routes = [
  { path: '', component: VaccineApp },
  { path: '**', redirectTo: '' }
];