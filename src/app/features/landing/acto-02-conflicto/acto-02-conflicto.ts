import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealSection } from '../../../shared/directives/reveal-section';

/**
 * Acto 02 — La tension.
 *
 * Nombra el problema con precision para que la solucion del acto siguiente
 * valga algo. Es el unico acto donde el oro practicamente desaparece.
 */
@Component({
  selector: 'app-acto-02-conflicto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealSection],
  templateUrl: './acto-02-conflicto.html',
  styleUrl: './acto-02-conflicto.css',
})
export class Acto02Conflicto {
  protected readonly tensiones = [
    {
      indice: '01',
      titulo: 'Cumplir por obligacion',
      texto: 'La normativa se atiende cuando aparece el problema, no antes.',
    },
    {
      indice: '02',
      titulo: 'Papeles sin gestion',
      texto: 'Documentacion que existe en una carpeta, pero no en la operacion.',
    },
    {
      indice: '03',
      titulo: 'Riesgo invisible',
      texto: 'Lo que nadie mide es exactamente lo que termina costando.',
    },
  ];
}
