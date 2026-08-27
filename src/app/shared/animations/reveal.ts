import { loadGsap, prefersReducedMotion, settleReveals } from './gsap-core';

type RevealKind = 'line' | 'up' | 'blur';

/**
 * Revelado al entrar en viewport para los elementos `[data-reveal]` de un
 * contenedor. Un solo ScrollTrigger.batch por seccion en vez de uno por
 * elemento: menos instancias, menos trabajo en el hilo principal.
 *
 * Devuelve una funcion de limpieza.
 */
export async function revealOnScroll(
  root: HTMLElement,
  options: { stagger?: number; start?: string } = {},
): Promise<() => void> {
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reveal]'),
  );
  if (!targets.length) return () => {};

  if (prefersReducedMotion()) {
    settleReveals(root);
    return () => {};
  }

  // Si el chunk de GSAP no llega —red caida, bloqueador, error de build— el
  // contenido NO puede quedarse invisible: se muestra tal cual y listo.
  let bundle;
  try {
    bundle = await loadGsap();
  } catch {
    settleReveals(root);
    return () => {};
  }
  const { gsap, ScrollTrigger } = bundle;
  const { stagger = 0.08, start = 'top 82%' } = options;

  const byKind = (kind: RevealKind) =>
    targets.filter((el) => (el.dataset['reveal'] || 'up') === kind);

  const triggers: ScrollTrigger[] = [];

  /**
   * Estado inicial + batch de entrada en una sola pasada.
   *
   * La guarda de longitud cubre tambien al `gsap.set`: no todas las secciones
   * traen los tres tipos de revelado, y GSAP avisa por consola ("target not
   * found") si se le pasa una lista vacia.
   */
  const reveal = (kind: RevealKind, desde: gsap.TweenVars, hasta: gsap.TweenVars) => {
    const els = byKind(kind);
    if (!els.length) return;

    gsap.set(els, desde);
    triggers.push(
      ...ScrollTrigger.batch(els, {
        start,
        once: true,
        onEnter: (batchEls) =>
          gsap.to(batchEls, { ...hasta, stagger, overwrite: 'auto' }),
      }),
    );
  };

  // Titulares: la linea se descubre desde abajo, como un plano que entra.
  reveal(
    'line',
    { clipPath: 'inset(105% 0 0 0)', opacity: 1 },
    { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'expo.out' },
  );

  // Texto y bloques: suben y aparecen.
  reveal(
    'up',
    { opacity: 0, y: 26 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' },
  );

  // Enfasis: entra desenfocado y toma foco.
  reveal(
    'blur',
    { opacity: 0, filter: 'blur(10px)', y: 12 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.9, ease: 'power2.out' },
  );

  return () => {
    triggers.forEach((t) => t.kill());
  };
}
