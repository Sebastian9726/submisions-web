import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/submissions', pathMatch: 'full' },
  { 
    path: 'submissions', 
    loadComponent: () => import('./submissions/submissions/submissions.component').then(c => c.SubmissionsComponent) 
  }
];
