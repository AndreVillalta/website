import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  viewChildren,
} from '@angular/core';
import { BotonVerMas } from '../../../shared/components/boton-ver-mas/boton-ver-mas';
import { RevealSection } from '../../../shared/directives/reveal-section';
import { isMobileViewport } from '../../../shared/animations/gsap-core';

/**
 * Acto 03 — La respuesta.
 *
 * Lista editorial numerada en vez de tarjetas. Con mouse, el estado activo lo
 * marca el hover; en tactil no hay hover, asi que lo determina la proximidad
 * de la fila al centro de la pantalla.
 */
@Component({
  selector: 'app-acto-03-solucion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotonVerMas, RevealSection],
  templateUrl: './acto-03-solucion.html',
  styleUrl: './acto-03-solucion.css',
})
export class Acto03Solucion implements OnDestroy {
  private readonly filas = viewChildren<ElementRef<HTMLElement>>('fila');
  private observer?: IntersectionObserver;

  protected readonly disciplinas = [
    {
      indice: '01',
      titulo: 'Seguridad e Higiene',
      texto:
        'Identificacion, evaluacion y control de riesgos laborales, con cumplimiento normativo verificable.',
    },
    {
      indice: '02',
      titulo: 'Salud Ocupacional',
      texto:
        'Programas de vigilancia y prevencion que protegen a las personas antes de que el dano ocurra.',
    },
    {
      indice: '03',
      titulo: 'Medio Ambiente',
      texto: 'Gestion ambiental y sostenibilidad, del diagnostico a la mejora continua.',
    },
    {
      indice: '04',
      titulo: 'Calidad',
      texto:
        'Sistemas de gestion y certificaciones ISO que ordenan la operacion, no solo el archivo.',
    },
  ];

  constructor() {
    afterNextRender(() => {
      if (!isMobileViewport()) return;

      // Banda estrecha en el centro del viewport: la fila que la cruza se activa.
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            e.target.classList.toggle('activa', e.isIntersecting);
          }
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );

      for (const f of this.filas()) this.observer.observe(f.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
