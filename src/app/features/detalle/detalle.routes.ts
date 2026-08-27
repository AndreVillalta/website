import { Routes } from '@angular/router';

export const detalleRoutes: Routes = [
  {
    path: 'soluciones',
    loadComponent: () =>
      import('./detalle-soluciones/detalle-soluciones').then((m) => m.DetalleSoluciones),
  },
  {
    path: 'trayectoria',
    loadComponent: () =>
      import('./detalle-trayectoria/detalle-trayectoria').then((m) => m.DetalleTrayectoria),
  },
  {
    path: 'diferenciador',
    loadComponent: () =>
      import('./detalle-diferenciador/detalle-diferenciador').then(
        (m) => m.DetalleDiferenciador,
      ),
  },
  { path: '', redirectTo: 'soluciones', pathMatch: 'full' },
];
