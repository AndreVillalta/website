import { hasFinePointer, loadGsap, prefersReducedMotion } from './gsap-core';

/** Duracion/ease del salto animado, compartida con la transicion del casco
 * (`irAlActo` en `casco.animation.ts`) para que se lean como un solo
 * movimiento en vez de dos animaciones corriendo por separado. */
export const DURACION_SALTO = 0.85;
export const EASE_SALTO = 'power2.inOut';

export interface SnapControl {
  /** Salta al acto de ese indice, animando el scroll de la pagina. */
  ir(indice: number): void;
}

/**
 * Puente para que otros componentes (el rail lateral, con sus flechas de
 * teclado) disparen el mismo salto animado sin necesitar una referencia
 * directa a la instancia activa. Es `null` cuando el snapping no esta
 * activo (touch, puntero impreciso o `prefers-reduced-motion`): en ese caso
 * quien lo consuma debe caer de vuelta a `scrollIntoView`.
 */
export const snapControl: { current: SnapControl | null } = { current: null };

/**
 * Scroll por saltos, al estilo scfo.de: un solo golpe de rueda avanza al
 * siguiente acto completo. Dentro de un acto mas alto que la pantalla el
 * scroll sigue siendo libre — el salto solo se dispara cuando el usuario ya
 * esta en el borde superior/inferior del acto activo y sigue scrolleando en
 * esa direccion.
 *
 * Solo se activa con puntero fino (mouse/trackpad) y sin movimiento
 * reducido: en touch un "golpe" no es un gesto comparable, y con movimiento
 * reducido el usuario pidio explicitamente que nada se anime por su cuenta.
 *
 * Devuelve una funcion de limpieza.
 */
export async function activarSnapScroll(ids: readonly string[]): Promise<() => void> {
  if (prefersReducedMotion() || !hasFinePointer()) return () => {};

  const { gsap } = await loadGsap();
  let animando = false;

  function indiceActual(): number {
    let idx = 0;
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el && el.getBoundingClientRect().top <= 1) idx = i;
    }
    return idx;
  }

  /** Cuanto scroll nativo queda todavia dentro del acto actual, en esa direccion. */
  function restante(direccion: 1 | -1, indice: number): number {
    const el = document.getElementById(ids[indice]);
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return direccion === 1 ? rect.bottom - window.innerHeight : -rect.top;
  }

  // Margen sobre el propio delta del gesto: si lo que queda del acto es
  // menor a "este golpe de rueda + margen", saltar directo en vez de dejar
  // que el scroll nativo consuma ese resto — de lo contrario, un acto que
  // sobra unos pixeles de una pantalla completa (algo que pasa incluso ya
  // afinados a 100vh, por redondeos y barras del navegador) obliga a un
  // segundo golpe de rueda solo para terminar de llegar al borde.
  const MARGEN_BORDE = 90;

  function saltar(destino: number): void {
    if (animando) return;
    const clamped = Math.max(0, Math.min(ids.length - 1, destino));
    const el = document.getElementById(ids[clamped]);
    if (!el) return;

    animando = true;

    // `html { scroll-behavior: smooth }` (para los anchors del rail) hace que
    // CUALQUIER escritura de scrollTop —incluida la de GSAP, frame a frame—
    // dispare tambien el scroll suave nativo del navegador. Los dos scrolls
    // corriendo a la vez confunden el `autoKill` del plugin (ve una posicion
    // que no es la que el mismo escribio) y mata el tween sin llamar a
    // `onComplete`, dejando `animando` trabado en `true` para siempre: la
    // rueda deja de responder hasta recargar la pagina. Se apaga el scroll
    // suave nativo mientras dura este tween puntual.
    const previoScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    let liberado = false;
    const liberar = () => {
      if (liberado) return;
      liberado = true;
      animando = false;
      document.documentElement.style.scrollBehavior = previoScrollBehavior;
      clearTimeout(salvavidas);
    };
    // Red de seguridad: si por lo que sea ni `onComplete` ni `onInterrupt`
    // llegaran a disparar, esto evita que el scroll quede trabado para
    // siempre en vez de, como mucho, unos milisegundos de mas.
    const salvavidas = window.setTimeout(liberar, DURACION_SALTO * 1000 + 400);

    gsap.to(window, {
      duration: DURACION_SALTO,
      ease: EASE_SALTO,
      scrollTo: { y: el, autoKill: true },
      onComplete: liberar,
      onInterrupt: liberar,
    });
  }

  function alRueda(e: WheelEvent): void {
    if (animando) {
      e.preventDefault();
      return;
    }

    const direccion: 1 | -1 | 0 = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (!direccion) return;

    const actual = indiceActual();
    if (direccion === 1 && actual >= ids.length - 1) return;
    if (direccion === -1 && actual <= 0) return;

    // Sobra mas de un golpe de rueda de contenido: se deja el scroll nativo
    // libre para leerlo.
    if (restante(direccion, actual) > Math.abs(e.deltaY) + MARGEN_BORDE) return;

    e.preventDefault();
    saltar(actual + direccion);
  }

  window.addEventListener('wheel', alRueda, { passive: false });
  snapControl.current = { ir: saltar };

  return () => {
    window.removeEventListener('wheel', alRueda);
    snapControl.current = null;
  };
}
