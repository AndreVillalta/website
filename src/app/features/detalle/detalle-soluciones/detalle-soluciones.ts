import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BloqueDetalle, PaginaDetalle } from '../pagina-detalle';
import { Seo } from '../../../core/services/seo';

@Component({
  selector: 'app-detalle-soluciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaDetalle],
  template: `
    <app-pagina-detalle
      rotulo="03 / La solucion"
      titulo="Cuatro disciplinas, un mismo sistema de gestion"
      entradilla="Cada frente se aborda con el mismo criterio: primero entender la operacion real, despues disenar el sistema que la sostiene."
      volverA="acto-03"
      [bloques]="bloques"
    />
  `,
})
export class DetalleSoluciones {
  protected readonly bloques: BloqueDetalle[] = [
    {
      indice: '01',
      titulo: 'Seguridad e Higiene',
      texto:
        'Relevamiento en planta, matriz de riesgos, medidas de control y plan de accion con responsables y plazos. El cumplimiento normativo deja de ser una carpeta y pasa a ser una rutina verificable.',
    },
    {
      indice: '02',
      titulo: 'Salud Ocupacional',
      texto:
        'Programas de vigilancia medica, estudios de puesto y planes de prevencion disenados sobre la exposicion real de cada tarea, no sobre un modelo generico.',
    },
    {
      indice: '03',
      titulo: 'Medio Ambiente',
      texto:
        'Diagnostico ambiental, gestion de residuos y efluentes, y hoja de ruta de mejora continua alineada con la normativa vigente y con los objetivos de la organizacion.',
    },
    {
      indice: '04',
      titulo: 'Calidad',
      texto:
        'Diseno e implementacion de sistemas de gestion y acompanamiento en procesos de certificacion ISO 9001, 14001 y 45001, desde el diagnostico inicial hasta la auditoria.',
    },
  ];

  constructor() {
    inject(Seo).aplicar({
      titulo: 'Soluciones | GB Consultores',
      descripcion:
        'Seguridad e Higiene, Salud Ocupacional, Medio Ambiente y Calidad: como trabaja GB Consultores cada disciplina, del relevamiento a la certificacion.',
      ruta: '/detalle/soluciones',
    });
  }
}
