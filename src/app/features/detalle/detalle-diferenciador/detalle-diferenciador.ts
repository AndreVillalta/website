import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BloqueDetalle, PaginaDetalle } from '../pagina-detalle';
import { Seo } from '../../../core/services/seo';

@Component({
  selector: 'app-detalle-diferenciador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaDetalle],
  template: `
    <app-pagina-detalle
      rotulo="04 / Por que nos eligen"
      titulo="Como trabajamos, de la primera reunion al seguimiento"
      entradilla="Un socio estrategico no entrega un informe y se va. Este es el proceso que sostiene la relacion."
      volverA="acto-04"
      [bloques]="bloques"
    />
  `,
})
export class DetalleDiferenciador {
  protected readonly bloques: BloqueDetalle[] = [
    {
      indice: '01',
      titulo: 'Diagnostico',
      texto:
        'Visitamos la operacion, hablamos con quienes hacen el trabajo y relevamos el estado real de cumplimiento. Sin ese paso, cualquier propuesta es teorica.',
    },
    {
      indice: '02',
      titulo: 'Diseno a medida',
      texto:
        'Armamos el sistema sobre los procesos que ya existen, en vez de imponer un modelo importado que nadie va a sostener.',
    },
    {
      indice: '03',
      titulo: 'Implementacion acompanada',
      texto:
        'Capacitamos a los equipos y acompanamos la puesta en marcha. Un interlocutor concreto que conoce la planta, no una mesa de ayuda.',
    },
    {
      indice: '04',
      titulo: 'Seguimiento',
      texto:
        'Auditorias internas y revisiones periodicas para que el sistema siga vivo despues de la certificacion, no solo el dia de la auditoria.',
    },
  ];

  constructor() {
    inject(Seo).aplicar({
      titulo: 'Por que nos eligen | GB Consultores',
      descripcion:
        'Diagnostico en planta, diseno a medida, implementacion acompanada y seguimiento: como trabaja GB Consultores con cada organizacion.',
      ruta: '/detalle/diferenciador',
    });
  }
}
