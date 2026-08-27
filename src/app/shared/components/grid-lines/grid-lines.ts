import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Hairlines verticales fijas alineadas al contenedor de encuadre.
 * Puramente decorativas: dan la lectura de "pelicula encuadrada" sin coste
 * de JS ni de red.
 */
@Component({
  selector: 'app-grid-lines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lines" aria-hidden="true">
      <div class="frame flex h-full justify-between">
        <span></span>
        <span class="mid"></span>
        <span class="mid"></span>
        <span></span>
      </div>
    </div>
  `,
  styles: `
    .lines {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }
    span {
      width: 1px;
      background: linear-gradient(
        to bottom,
        transparent,
        color-mix(in srgb, var(--color-bone) 6%, transparent) 12%,
        color-mix(in srgb, var(--color-bone) 6%, transparent) 88%,
        transparent
      );
    }
    @media (max-width: 767px) {
      .mid { display: none; }
    }
  `,
})
export class GridLines {}
