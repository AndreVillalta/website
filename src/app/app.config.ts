import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import {
  provideClientHydration,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // El scroll salta al ancla al navegar y vuelve arriba al cambiar de pagina.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions(),
    ),
    // Hidratacion incremental: el servidor entrega el HTML completo de los seis
    // actos y solo se difiere el trabajo de JavaScript de cada bloque @defer.
    /*provideClientHydration(withIncrementalHydration()),*/
    provideClientHydration()
  ],
};
