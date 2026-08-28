import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BloqueDetalle, PaginaDetalle } from '../pagina-detalle';
import { Seo } from '../../../core/services/seo';

@Component({
  selector: 'app-detalle-trayectoria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaDetalle],
  template: `
    <app-pagina-detalle
      rotulo="01 / Trayectoria"
      titulo="Más de 15 años de trabajo en operaciones reales"
      entradilla="La experiencia no se mide en años sino en contextos distintos resueltos. Estos son los sectores donde ya trabajamos."
      volverA="acto-01"
      [bloques]="bloques"
    />
  `,
})
export class DetalleTrayectoria {
  protected readonly bloques: BloqueDetalle[] = [
    {
      indice: '01',
      titulo: 'Industria y agroindustria',
      texto:
        'Plantas de proceso con maquinaria pesada, riesgo químico y turnos rotativos, donde la gestión de riesgos tiene que convivir con la producción.',
    },
    {
      indice: '02',
      titulo: 'Construcción y logística',
      texto:
        'Obras y centros de distribución: entornos que cambian todas las semanas y exigen un sistema que se adapte sin perder trazabilidad.',
    },
    {
      indice: '03',
      titulo: 'Educación, salud y oficinas',
      texto:
        'Instituciones con alta circulación de personas, donde el foco esta en los planes de emergencia, la ergonomía y las condiciones del ambiente de trabajo.',
    },
    {
      indice: '04',
      titulo: 'Retail',
      texto:
        'Redes de sucursales que necesitan un mismo estándar replicable en muchos puntos, con auditorías periódicas y capacitación continua.',
    },
  ];

  constructor() {
    inject(Seo).aplicar({
      titulo: 'Trayectoria | GB Consultores',
      descripcion:
        'Mas de 15 años de experiencia en industria, construcción, educación, logística, retail, agroindustria, oficinas y salud.',
      ruta: '/detalle/trayectoria',
    });
  }
}
