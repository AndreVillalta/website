import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { heroIsotipoListo, heroIsotipoRef } from '../../../shared/animations/logo-flip';
import { CtaMagnetica } from '../../../shared/components/cta-magnetica/cta-magnetica';

/**
 * Acto 00 — El plano de apertura.
 *
 * El titular se sirve prerenderizado y visible: es el elemento LCP y no
 * depende de JavaScript. Toda la secuencia de apertura —telon, dibujado del
 * isotipo, entradas escalonadas— vive en CSS, asi que empieza en el primer
 * pintado y no espera a que cargue GSAP. Lo unico que necesita JS aca es
 * ocultar el indicador de scroll, y es una clase.
 */
@Component({
  selector: 'app-acto-00-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CtaMagnetica],
  templateUrl: './acto-00-hero.html',
  styleUrl: './acto-00-hero.css',
})
export class Acto00Hero {
  protected readonly scrolleado = signal(false);
  /** Reexportado para el template: ver `logo-flip.ts`. */
  protected readonly heroIsotipoListo = heroIsotipoListo;

  private readonly isotipo = viewChild<ElementRef<HTMLElement>>('isotipo');

  constructor() {
    afterNextRender(() => {
      window.addEventListener('scroll', () => this.scrolleado.set(true), {
        passive: true,
        once: true,
      });

      heroIsotipoRef.current = this.isotipo()?.nativeElement ?? null;
    });
  }
}
