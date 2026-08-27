import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Enlace discreto a la pagina de detalle de un acto. */
@Component({
  selector: 'app-boton-ver-mas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a [routerLink]="ruta()" class="ver-mas">
      <span><ng-content>Ver mas</ng-content></span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  `,
  styles: `
    :host { display: inline-block; }

    .ver-mas {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--color-bone) 16%, transparent);
      color: var(--color-bone-dim);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      transition: color 0.4s var(--ease-cine), border-color 0.4s var(--ease-cine);
    }

    .ver-mas:hover {
      color: var(--color-brand-gold);
      border-color: var(--color-brand-gold);
    }

    svg {
      width: 1rem;
      height: 1rem;
      transition: transform 0.4s var(--ease-cine);
    }

    .ver-mas:hover svg { transform: translateX(4px); }

    /* En pantalla tactil el enlace tiene que llegar a los 44 px de alto. */
    @media (pointer: coarse) {
      .ver-mas {
        padding-block: 0.9rem;
        padding-bottom: 0.85rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ver-mas:hover svg { transform: none; }
    }
  `,
})
export class BotonVerMas {
  readonly ruta = input.required<string>();
}
