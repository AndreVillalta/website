import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { ScrollToPlugin as ScrollToPluginType } from 'gsap/ScrollToPlugin';

export interface GsapBundle {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  ScrollToPlugin: typeof ScrollToPluginType;
}

let pending: Promise<GsapBundle> | null = null;

/**
 * Carga unica y compartida de GSAP + ScrollTrigger + ScrollToPlugin.
 *
 * Se importa de forma dinamica para que no entre en el bundle inicial: el LCP
 * es el H1 del Hero, que se sirve prerenderizado y no necesita JS. Todos los
 * componentes comparten la misma promesa, asi el chunk se descarga una sola vez.
 */
export function loadGsap(): Promise<GsapBundle> {
  pending ??= (async () => {
    const [{ gsap }, { ScrollTrigger }, { ScrollToPlugin }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/ScrollToPlugin'),
    ]);
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    return { gsap, ScrollTrigger, ScrollToPlugin };
  })();
  return pending;
}

/** El usuario pidio menos movimiento: ninguna animacion debe correr. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Solo hay hover real con mouse o trackpad; en tactil no aplica. */
export function hasFinePointer(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );
}

export function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

/**
 * Deja los elementos marcados con `data-reveal` en su estado final.
 * Se usa cuando no se va a animar (movimiento reducido, o GSAP no cargo).
 */
export function settleReveals(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '1';
    el.style.clipPath = 'none';
    el.style.transform = 'none';
  });
}
