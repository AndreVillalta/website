import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => {
  console.error(err);
  // Si la aplicacion no arranca, el HTML prerenderizado sigue ahi: lo unico
  // que hay que hacer es dejar de ocultar los elementos que iban a animarse.
  document.documentElement.classList.remove('js-ready');
});

/**
 * Red de seguridad de ultima instancia.
 *
 * `.js-ready` oculta los elementos marcados con `data-reveal` a la espera de
 * que GSAP los anime. Si la hidratacion se cuelga o el chunk de animacion
 * nunca llega, el texto se quedaria invisible para siempre. Pasado el umbral
 * se quita la clase y todo se vuelve legible; cuando GSAP si funciona, las
 * animaciones escriben estilos en linea que ganan sobre esta regla, asi que
 * quitarla no tiene ningun efecto visible.
 */
setTimeout(() => {
  document.documentElement.classList.remove('js-ready');
}, 5000);
