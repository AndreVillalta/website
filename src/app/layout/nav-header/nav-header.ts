import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

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
    });
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
