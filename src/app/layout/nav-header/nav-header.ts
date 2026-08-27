import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { headerLogoListo, logoSlotRef } from '../../shared/animations/logo-flip';

interface Enlace {
  href: string;
  texto: string;
}

/**
 * Navegacion que muta de barra completa a pildora flotante al scrollear.
 * Solo se animan `transform`, `opacity` y propiedades ya compuestas — no hace
 * falta GSAP: una transicion CSS alcanza y no suma JS al bundle.
 */
@Component({
  selector: 'app-nav-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './nav-header.html',
  styleUrl: './nav-header.css',
})
export class NavHeader {
  protected readonly compacta = signal(false);
  protected readonly menuAbierto = signal(false);
  /** Reexportado para el template: ver `logo-flip.ts`. */
  protected readonly headerLogoListo = headerLogoListo;

  private readonly logoSlot = viewChild<ElementRef<HTMLElement>>('logoSlot');

  protected readonly enlaces: Enlace[] = [
    { href: '#acto-01', texto: 'Trayectoria' },
    { href: '#acto-03', texto: 'Soluciones' },
    { href: '#acto-04', texto: 'Nosotros' },
  ];

  constructor() {
    afterNextRender(() => {
      const alScrollear = () => this.compacta.set(window.scrollY > 80);
      alScrollear();
      window.addEventListener('scroll', alScrollear, { passive: true });

      // Solo en la landing hay un Hero del que "volar": en el resto de las
      // rutas el logo del header se queda visible siempre (ver `logo-flip.ts`).
      if (document.getElementById('acto-00')) {
        logoSlotRef.current = this.logoSlot()?.nativeElement ?? null;
        headerLogoListo.set(false);
      }
    });
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
