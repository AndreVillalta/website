import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BloqueDetalle {
  indice: string;
  titulo: string;
  texto: string;
}

/**
 * Envoltorio comun de las paginas de "Ver mas".
 *
 * Mantiene la direccion de arte de la landing —encuadre, rotulo numerado,
 * lista editorial— y garantiza que las tres paginas tengan el mismo boton de
 * vuelta en el mismo lugar.
 */
@Component({
  selector: 'app-pagina-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="detalle">
      <div class="frame">
        <a routerLink="/" [fragment]="volverA()" class="volver">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Volver
        </a>

        <p class="eyebrow">{{ rotulo() }}</p>
        <h1>{{ titulo() }}</h1>
        <p class="entradilla">{{ entradilla() }}</p>

        <ol class="lista-editorial">
          @for (b of bloques(); track b.indice) {
            <li>
              <span class="indice" aria-hidden="true">{{ b.indice }}</span>
              <h2>{{ b.titulo }}</h2>
              <p>{{ b.texto }}</p>
            </li>
          }
        </ol>

        <div class="cierre">
          <p>Cuentenos su caso y armamos una propuesta concreta.</p>
          <a href="mailto:contacto&#64;grupoboggio.ar" class="contacto">
            contacto&#64;grupoboggio.ar
          </a>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }

    .detalle {
      position: relative;
      z-index: 10;
      padding-block: 9rem 6rem;
      background-color: var(--color-ink-900);
      min-height: 100svh;
    }

    .volver {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 3.5rem;
      color: var(--color-bone-mute);
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      transition: color 0.4s var(--ease-cine);
    }

    .volver:hover { color: var(--color-brand-gold); }

    .volver svg {
      width: 1rem;
      height: 1rem;
      transition: transform 0.4s var(--ease-cine);
    }

    .volver:hover svg { transform: translateX(-4px); }

    h1 {
      max-width: 26ch;
      margin-top: 1.25rem;
      font-size: var(--text-acto);
      line-height: var(--text-acto--line-height);
      letter-spacing: var(--text-acto--letter-spacing);
      font-weight: 200;
    }

    .entradilla {
      max-width: 38rem;
      margin-top: 1.75rem;
      font-size: var(--text-lead);
      line-height: var(--text-lead--line-height);
      color: var(--color-bone-dim);
    }

    .lista-editorial h2 {
      font-size: clamp(1.25rem, 2.2vw, 1.75rem);
      font-weight: 200;
      letter-spacing: -0.015em;
      color: var(--color-bone);
    }

    .cierre {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem 2rem;
      margin-top: 4rem;
    }

    .cierre p { color: var(--color-bone-dim); }

    .contacto {
      color: var(--color-brand-gold);
      font-weight: 700;
      border-bottom: 1px solid currentColor;
      padding-bottom: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .volver:hover svg { transform: none; }
    }
  `,
})
export class PaginaDetalle {
  readonly rotulo = input.required<string>();
  readonly titulo = input.required<string>();
  readonly entradilla = input.required<string>();
  readonly bloques = input.required<BloqueDetalle[]>();
  /** Fragmento de la landing al que vuelve el boton. */
  readonly volverA = input<string>('acto-00');
}
