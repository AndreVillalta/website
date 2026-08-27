import {
  Directive,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { revealOnScroll } from '../animations/reveal';

/**
 * Aplica el revelado al entrar en viewport a todos los `[data-reveal]` que
 * cuelgan del elemento anfitrion. Evita repetir el mismo bloque de animacion
 * en cada acto.
 */
@Directive({ selector: '[appRevealSection]' })
export class RevealSection implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      revealOnScroll(this.host.nativeElement).then((c) => {
        this.cleanup = c;
      });
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
