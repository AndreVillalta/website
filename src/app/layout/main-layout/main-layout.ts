import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavHeader } from '../nav-header/nav-header';
import { Footer } from '../footer/footer';
import { FilmGrain } from '../../shared/components/film-grain/film-grain';
import { GridLines } from '../../shared/components/grid-lines/grid-lines';

/** Envoltorio comun: el chrome persistente de la pelicula. */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavHeader, Footer, FilmGrain, GridLines],
  template: `
    <a href="#contenido" class="salto">Saltar al contenido</a>

    <app-grid-lines />
    <app-film-grain />
    <app-nav-header />

    <main id="contenido">
      <router-outlet />
    </main>

    <app-footer />
  `,
  styles: `
    :host { display: block; }

    main {
      position: relative;
      z-index: 10;
    }

    .salto {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 100;
      padding: 0.75rem 1.25rem;
      background: var(--color-brand-gold);
      border-radius: 999px;
      color: var(--color-ink-900);
      font-size: 0.78rem;
      font-weight: 700;
      transform: translateY(-160%);
      transition: transform 0.3s var(--ease-cine);
    }

    .salto:focus-visible { transform: translateY(0); }
  `,
})
export class MainLayout {}
