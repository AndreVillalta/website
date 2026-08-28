import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../../core/services/seo';

/**
 * Esqueleto del portal interno.
 *
 * El formulario esta deshabilitado a proposito y no envia nada a ningun lado:
 * la autenticacion y la autorizacion son una fase posterior. Lo que existe hoy
 * es la ruta, el guard de enganche y la pantalla, para que el acceso del footer
 * lleve a algun lugar coherente desde el primer dia.
 */
@Component({
  selector: 'app-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="portal">
      <div class="tarjeta">
        <img src="logo-footer.svg" alt="GB Consultores" width="56" height="42" />

        <p class="eyebrow">Acceso restringido</p>
        <h1>Portal interno</h1>
        <p class="nota">
          Espacio reservado al personal de la consultoria. El acceso todavia no
          esta habilitado.
        </p>

        <form class="formulario" aria-describedby="aviso-portal">
          <label>
            <span>Usuario</span>
            <input type="text" name="usuario" autocomplete="off" disabled />
          </label>
          <label>
            <span>Contrasena</span>
            <input type="password" name="clave" autocomplete="off" disabled />
          </label>
          <button type="button" disabled>Ingresar</button>
        </form>

        <p id="aviso-portal" class="aviso">
          Formulario no operativo. La autenticacion se implementa en una fase
          posterior.
        </p>

        <a routerLink="/" class="volver">Volver al sitio</a>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .portal {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100svh;
      padding: 7rem 1.5rem 4rem;
      background-color: var(--color-ink-900);
      position: relative;
      z-index: 10;
    }

    .tarjeta {
      width: 100%;
      max-width: 25rem;
      padding: 2.75rem;
      border: 1px solid color-mix(in srgb, var(--color-bone) 9%, transparent);
      border-radius: 16px;
      background-color: var(--color-ink-850);
      text-align: center;
    }

    .tarjeta img {
      width: auto;
      height: 2.5rem;
      margin: 0 auto 1.75rem;
    }

    h1 {
      margin-top: 0.75rem;
      font-size: 1.75rem;
      font-weight: 200;
      letter-spacing: -0.02em;
    }

    .nota {
      margin-top: 0.85rem;
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--color-bone-mute);
    }

    .formulario {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2.25rem;
      text-align: left;
    }

    label span {
      display: block;
      margin-bottom: 0.45rem;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-bone-mute);
    }

    input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid color-mix(in srgb, var(--color-bone) 10%, transparent);
      border-radius: 8px;
      background-color: var(--color-ink-800);
      color: var(--color-bone);
      font: inherit;
      font-size: 0.9rem;
    }

    button {
      margin-top: 0.5rem;
      padding: 0.8rem;
      border: none;
      border-radius: 999px;
      background-color: var(--color-brand-blue);
      color: var(--color-ink-900);
      font: inherit;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    input:disabled,
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .aviso {
      margin-top: 1.25rem;
      font-size: 0.72rem;
      line-height: 1.6;
      color: var(--color-brand-gold);
    }

    .volver {
      display: inline-block;
      margin-top: 2rem;
      color: var(--color-bone-dim);
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-bottom: 1px solid color-mix(in srgb, var(--color-bone) 20%, transparent);
      padding-bottom: 3px;
      transition: color 0.35s var(--ease-cine);
    }

    .volver:hover { color: var(--color-brand-gold); }
  `,
})
export class Portal {
  constructor() {
    inject(Seo).aplicar({
      titulo: 'Portal interno | GB Consultores',
      descripcion: 'Acceso reservado al personal de GB Consultores.',
      ruta: '/portal',
      noIndexar: true,
    });
  }
}
