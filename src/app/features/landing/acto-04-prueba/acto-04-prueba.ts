import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BotonVerMas } from '../../../shared/components/boton-ver-mas/boton-ver-mas';
import { RevealSection } from '../../../shared/directives/reveal-section';

interface Testimonio {
  cita: string;
  nombre: string;
  cargo: string;
  empresa: string;
}

/**
 * Acto 04 — La prueba.
 *
 * `testimonios` arranca vacio a proposito. Mientras no haya citas reales
 * aprobadas por el cliente, la seccion muestra un bloque de espacio reservado
 * en vez de contenido inventado.
 */
@Component({
  selector: 'app-acto-04-prueba',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotonVerMas, RevealSection],
  templateUrl: './acto-04-prueba.html',
  styleUrl: './acto-04-prueba.css',
})
export class Acto04Prueba {
  protected readonly pilares = [
    {
      titulo: 'Soluciones a medida',
      texto: 'Ninguna organizacion recibe el manual de otra.',
    },
    {
      titulo: 'Equipo multidisciplinario',
      texto:
        'Especialistas en seguridad, salud, ambiente y calidad trabajando sobre el mismo caso.',
    },
    {
      titulo: 'Cercania real',
      texto: 'Un interlocutor que conoce su planta, no un numero de ticket.',
    },
    {
      titulo: 'Cumplimiento como gestion',
      texto: 'La norma deja de ser un costo y pasa a ser una ventaja operativa.',
    },
  ];

  protected readonly testimonios: Testimonio[] = [];
}
