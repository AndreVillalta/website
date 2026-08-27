import { loadGsap, prefersReducedMotion } from './gsap-core';

/**
 * Anima los numeros marcados con `data-contador="<valor final>"` cuando entran
 * en pantalla. El HTML ya trae el valor final escrito, asi que sin JS —o con
 * movimiento reducido— la cifra se lee igual.
 */
export async function animarContadores(root: HTMLElement): Promise<() => void> {
  const nodos = Array.from(root.querySelectorAll<HTMLElement>('[data-contador]'));
  if (!nodos.length || prefersReducedMotion()) return () => {};

  const { gsap, ScrollTrigger } = await loadGsap();

  const triggers = ScrollTrigger.batch(nodos, {
    start: 'top 85%',
    once: true,
    onEnter: (els) => {
      for (const el of els as HTMLElement[]) {
        const destino = Number(el.dataset['contador']);
        if (!Number.isFinite(destino)) continue;
        const estado = { valor: 0 };
        gsap.to(estado, {
          valor: destino,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(estado.valor));
          },
        });
      }
    },
  });

  return () => triggers.forEach((t) => t.kill());
}
