import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Capa de acabado: grano de film y vinieta.
 *
 * El grano es un SVG de turbulencia embebido como `data:` URI — cero requests
 * de red — y la vinieta es un gradiente. Ninguno de los dos usa `filter: blur()`
 * ni se repinta durante el scroll.
 */
@Component({
  selector: 'app-film-grain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vignette" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>
  `,
  styles: `
    .vignette,
    .grain {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }

    .vignette {
      background: radial-gradient(
        ellipse 120% 100% at 50% 45%,
        transparent 35%,
        color-mix(in srgb, var(--color-ink-900) 55%, transparent) 78%,
        var(--color-ink-900) 100%
      );
    }

    .grain {
      z-index: 3;
      opacity: 0.035;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  `,
})
export class FilmGrain {}
