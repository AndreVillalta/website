import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';
import {
  hasFinePointer,
  loadGsap,
  prefersReducedMotion,
} from '../../animations/gsap-core';

/**
 * Boton principal de llamada a la accion.
 *
 * Con mouse o trackpad se vuelve magnetico: sigue al cursor hasta 8 px y un
 * destello recorre su superficie. En tactil, con teclado o con movimiento
 * reducido es un enlace normal, sin ninguna penalizacion.
 */
@Component({
  selector: 'app-cta-magnetica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cta-magnetica.html',
  styleUrl: './cta-magnetica.css',
})
export class CtaMagnetica implements OnDestroy {
  readonly href = input.required<string>();
  readonly variante = input<'solida' | 'contorno' | 'fantasma'>('contorno');

  private readonly enlace = viewChild.required<ElementRef<HTMLAnchorElement>>('enlace');
  private desconectar?: () => void;

  constructor() {
    afterNextRender(() => this.activarMagnetismo());
  }

  private async activarMagnetismo(): Promise<void> {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const el = this.enlace().nativeElement;
    const { gsap } = await loadGsap();

    const moverX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const moverY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const seguir = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      moverX(((e.clientX - (r.left + r.width / 2)) / r.width) * 16);
      moverY(((e.clientY - (r.top + r.height / 2)) / r.height) * 16);
    };
    const soltar = () => {
      moverX(0);
      moverY(0);
    };

    el.addEventListener('pointermove', seguir);
    el.addEventListener('pointerleave', soltar);

    this.desconectar = () => {
      el.removeEventListener('pointermove', seguir);
      el.removeEventListener('pointerleave', soltar);
    };
  }

  ngOnDestroy(): void {
    this.desconectar?.();
  }
}
