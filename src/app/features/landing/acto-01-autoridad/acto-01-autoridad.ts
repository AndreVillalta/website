import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { BotonVerMas } from '../../../shared/components/boton-ver-mas/boton-ver-mas';
import { RevealSection } from '../../../shared/directives/reveal-section';
import { animarContadores } from '../../../shared/animations/contador';

interface Cifra {
  rotulo: string;
  prefijo?: string;
  numero: number | null;
  texto?: string;
  sufijo?: string;
  descriptor: string;
}

/**
 * Acto 01 — Las credenciales.
 *
 * Las cuatro cifras salen de datos ya aprobados en las especificaciones. No se
 * publican metricas de negocio sin validar (satisfaccion, siniestralidad,
 * tiempos): serian afirmaciones inventadas sobre un cliente real.
 */
@Component({
  selector: 'app-acto-01-autoridad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotonVerMas, RevealSection],
  templateUrl: './acto-01-autoridad.html',
  styleUrl: './acto-01-autoridad.css',
})
export class Acto01Autoridad implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  protected readonly cifras: Cifra[] = [
    { rotulo: 'Experiencia', prefijo: '+', numero: 15, descriptor: 'anos en gestion de riesgos' },
    { rotulo: 'Sectores', numero: 8, descriptor: 'industrias atendidas' },
    { rotulo: 'Normas', numero: null, texto: 'ISO', descriptor: '9001 · 14001 · 45001' },
    { rotulo: 'Enfoque', numero: 100, sufijo: '%', descriptor: 'soluciones a medida' },
  ];

  protected readonly sectores = [
    'Industria',
    'Construccion',
    'Educacion',
    'Logistica',
    'Retail',
    'Agroindustria',
    'Oficinas',
    'Salud',
  ];

  constructor() {
    afterNextRender(() => {
      animarContadores(this.host.nativeElement).then((c) => (this.cleanup = c));
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
