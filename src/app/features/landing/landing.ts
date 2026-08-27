import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CascoFlotante } from '../../shared/components/casco-flotante/casco-flotante';
import { RailScroll } from '../../shared/components/rail-scroll/rail-scroll';
import { Acto00Hero } from './acto-00-hero/acto-00-hero';
import { Acto01Autoridad } from './acto-01-autoridad/acto-01-autoridad';
import { Acto02Conflicto } from './acto-02-conflicto/acto-02-conflicto';
import { Acto03Solucion } from './acto-03-solucion/acto-03-solucion';
import { Acto04Prueba } from './acto-04-prueba/acto-04-prueba';
import { Acto05Cierre } from './acto-05-cierre/acto-05-cierre';
import { Seo } from '../../core/services/seo';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CascoFlotante,
    RailScroll,
    Acto00Hero,
    Acto01Autoridad,
    Acto02Conflicto,
    Acto03Solucion,
    Acto04Prueba,
    Acto05Cierre,
  ],
  templateUrl: './landing.html',
  styles: ':host { display: block; } .reserva { min-height: 70vh; }',
})
export class Landing {
  constructor() {
    inject(Seo).aplicar({
      titulo: 'GB Consultores | Seguridad, Salud Ocupacional, Medio Ambiente y Calidad',
      descripcion:
        'Consultora argentina en Seguridad, Salud Ocupacional, Medio Ambiente y Calidad. Mas de 15 anos convirtiendo el cumplimiento normativo en gestion que reduce riesgos y mejora el desempeno.',
      ruta: '/',
    });
  }
}
