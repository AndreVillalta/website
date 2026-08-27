import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  afterNextRender,
  signal,
} from '@angular/core';
import { snapControl } from '../../animations/acto-snap';

export interface Acto {
  id: string;
  texto: string;
}

/** Los seis actos, en orden de lectura. */
export const ACTOS: Acto[] = [
  { id: 'acto-00', texto: 'Inicio' },
  { id: 'acto-01', texto: 'Trayectoria' },
  { id: 'acto-02', texto: 'El conflicto' },
  { id: 'acto-03', texto: 'La solucion' },
  { id: 'acto-04', texto: 'Por que nos eligen' },
  { id: 'acto-05', texto: 'Hablemos' },
];

/**
 * Indice lateral fijo con el acto activo, al estilo de un guion tecnico.
 *
 * Usa IntersectionObserver en vez de ScrollTrigger: no necesita GSAP, no
 * escucha el evento de scroll y el navegador hace el trabajo fuera del hilo
 * principal.
 */
@Component({
  selector: 'app-rail-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rail-scroll.html',
  styleUrl: './rail-scroll.css',
})
export class RailScroll implements OnDestroy {
  protected readonly actos = ACTOS;
  protected readonly activo = signal('acto-00');

  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      this.observar();
      window.addEventListener('keydown', this.alPresionarTecla);
    });
  }

  private observar(): void {
    /*
      Linea de lectura: una banda fina al 45 % de la altura del viewport. El
      acto que la cruza es el activo.

      Es mas robusto que observar por proporcion visible: un acto mas alto que
      la pantalla nunca llega a un ratio alto, asi que con umbrales de ratio el
      indice se puede quedar trabado mientras se scrollea dentro de esa misma
      seccion. Con la banda, cada acto entra y sale exactamente una vez.
    */
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.activo.set(e.target.id);
        }
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 },
    );

    for (const { id } of this.actos) {
      const el = document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }

  /**
   * Flechas arriba/abajo saltan de acto. No se interceptan si el foco esta en
   * un campo editable ni si hay modificadores en juego.
   */
  private readonly alPresionarTecla = (e: KeyboardEvent): void => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    const objetivo = e.target as HTMLElement | null;
    if (
      objetivo?.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo?.tagName ?? '')
    ) {
      return;
    }

    const i = this.actos.findIndex((a) => a.id === this.activo());
    const indiceSiguiente = e.key === 'ArrowDown' ? i + 1 : i - 1;
    const siguiente = this.actos[indiceSiguiente];
    if (!siguiente) return;

    e.preventDefault();

    // Con snapping activo, saltar asi mantiene el casco coordinado con el
    // mismo movimiento animado que usa la rueda; sin el (touch, movimiento
    // reducido), cae de vuelta al scroll nativo.
    if (snapControl.current) {
      snapControl.current.ir(indiceSiguiente);
    } else {
      document.getElementById(siguiente.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.alPresionarTecla);
    }
  }
}
