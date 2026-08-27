import { signal } from '@angular/core';
import { DURACION_SALTO, EASE_SALTO } from './acto-snap';
import { loadGsap, prefersReducedMotion } from './gsap-core';

/**
 * El isotipo del Hero "vuela" hasta el logo del header al dejar el acto 00,
 * y vuelve si el usuario scrollea de nuevo hasta ahi. Puente entre
 * `NavHeader` y `Acto00Hero` (son hermanos lejanos en el arbol, no padre e
 * hijo): mismo patron de referencia mutable que `snapControl` en
 * `acto-snap.ts`, sin necesitar un servicio con DI para algo tan puntual.
 */

/** Visible el logo combinado del header ("GB | Consultores"). En rutas sin
 * Hero (no hay `#acto-00`) queda en `true` de entrada y este modulo nunca
 * lo toca. */
export const headerLogoListo = signal(true);

/** Visible el isotipo original del Hero. Se apaga justo antes de que el clon
 * que vuela lo reemplace visualmente. */
export const heroIsotipoListo = signal(true);

/** Wrapper `.isotipo` del Hero: adentro vive el `<svg>` real, ya dibujado. */
export const heroIsotipoRef: { current: HTMLElement | null } = { current: null };

/** Marcador invisible en el header: mismo alto/proporcion que el isotipo,
 * ubicado donde deberia "aterrizar" dentro del logo combinado. */
export const logoSlotRef: { current: HTMLElement | null } = { current: null };

let enHero = true;
let volando = false;

/**
 * Reacciona a cambios de acto activo (ver `acto-activo.ts`): si se cruza el
 * limite entre el Hero (indice 0) y cualquier otro acto, dispara el vuelo.
 * Un aviso repetido del mismo lado del limite no hace nada.
 */
export async function manejarCambioDeActo(indice: number): Promise<void> {
  const ahoraEnHero = indice === 0;
  if (ahoraEnHero === enHero) return;
  enHero = ahoraEnHero;
  await volar(ahoraEnHero ? 'volver' : 'ir');
}

async function volar(sentido: 'ir' | 'volver'): Promise<void> {
  const heroEl = heroIsotipoRef.current;
  const slotEl = logoSlotRef.current;
  const svgOrigen = heroEl?.querySelector('svg');

  if (volando || !heroEl || !slotEl || !svgOrigen || prefersReducedMotion()) {
    // Sin elementos (SSR, ruta sin Hero), vuelo ya en curso, o movimiento
    // reducido: cambio seco de visibilidad, sin clon volador.
    headerLogoListo.set(sentido === 'ir');
    heroIsotipoListo.set(sentido === 'volver');
    return;
  }

  volando = true;
  if (sentido === 'ir') heroIsotipoListo.set(false);
  else headerLogoListo.set(false);

  const origenRect = (sentido === 'ir' ? svgOrigen : slotEl).getBoundingClientRect();
  const destinoRect = (sentido === 'ir' ? slotEl : svgOrigen).getBoundingClientRect();

  const { gsap } = await loadGsap();

  // El clon viaja dentro de un `<div>` normal (no el propio `<svg>`): asi
  // GSAP anima `x`/`y`/`width`/`height` como propiedades CSS de toda la vida,
  // sin la ambiguedad de si un target SVG usa atributos `x`/`y` o `transform`.
  const envoltorio = document.createElement('div');
  envoltorio.setAttribute('aria-hidden', 'true');
  envoltorio.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    z-index: 200;
    pointer-events: none;
    width: ${origenRect.width}px;
    height: ${origenRect.height}px;
  `;

  const clon = svgOrigen.cloneNode(true) as SVGElement;
  // El trazo se dibuja con una animacion CSS por clase (`.trazo`): clonar el
  // nodo tambien clona esa animacion, que arrancaria de nuevo desde cero
  // (invisible) en vez de mostrar el isotipo ya formado. Se la reemplaza por
  // su estado final fijo.
  clon.querySelectorAll('.trazo').forEach((trazo) => {
    const el = trazo as SVGElement;
    el.style.animation = 'none';
    el.style.strokeDashoffset = '0';
    el.style.fillOpacity = '1';
    el.style.strokeOpacity = '0';
  });
  clon.style.cssText = 'display: block; width: 100%; height: 100%; overflow: visible;';
  envoltorio.appendChild(clon);
  document.body.appendChild(envoltorio);

  gsap.set(envoltorio, { x: origenRect.left, y: origenRect.top });

  await new Promise<void>((resolve) => {
    gsap.to(envoltorio, {
      x: destinoRect.left,
      y: destinoRect.top,
      width: destinoRect.width,
      height: destinoRect.height,
      duration: DURACION_SALTO,
      ease: EASE_SALTO,
      onComplete: resolve,
    });
  });

  envoltorio.remove();
  if (sentido === 'ir') headerLogoListo.set(true);
  else heroIsotipoListo.set(true);
  volando = false;
}
