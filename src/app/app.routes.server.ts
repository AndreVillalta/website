import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  /*
    El portal se renderiza en el servidor bajo demanda, no se prerenderiza.
    Asi el `noindex` sale en el HTML inicial —no despues de hidratar— y, cuando
    la ruta tenga contenido real detras de autenticacion, no queda un archivo
    estatico servido a cualquiera.
  */
  { path: 'portal', renderMode: RenderMode.Server },

  // Todo lo publico es estatico: se genera en el build.
  { path: '**', renderMode: RenderMode.Prerender },
];
