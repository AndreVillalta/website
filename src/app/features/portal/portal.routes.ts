import { Routes } from '@angular/router';
import { portalGuard } from '../../core/guards/portal.guard';

export const portalRoutes: Routes = [
  {
    path: '',
    canActivate: [portalGuard],
    loadComponent: () => import('./portal').then((m) => m.Portal),
  },
];
