import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/landing/landing.routes').then((m) => m.landingRoutes),
      },
      {
        path: 'detalle',
        loadChildren: () =>
          import('./features/detalle/detalle.routes').then((m) => m.detalleRoutes),
      },
      {
        path: 'portal',
        loadChildren: () =>
          import('./features/portal/portal.routes').then((m) => m.portalRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
