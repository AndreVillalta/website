import { isMobileViewport } from '../../../animations/gsap-core';

export interface QualityTier {
  isMobile: boolean;
  antialias: boolean;
  dprCap: number;
  maxPixels: number;
  /** En movil el casco se queda centrado: solo cambian luz, escala y opacidad. */
  deriva: boolean;
  /**
   * Viewport angosto de verdad (<768px), no "equipo modesto".
   *
   * `deriva` tambien se apaga en un portatil de pocos nucleos, y ahi la
   * composicion sigue siendo la de escritorio. La direccion de arte del Hero
   * en movil —casco abajo, texto arriba— depende del ancho de pantalla y de
   * nada mas, asi que necesita su propia bandera.
   */
  compacto: boolean;
}

/**
 * Presupuesto de render segun el equipo.
 *
 * El corte no es solo el ancho de viewport: un portatil con pocos nucleos
 * sufre igual que un telefono, y ahi conviene bajar antes de que se note.
 *
 * Los topes de pixeles son deliberadamente conservadores: el casco es un
 * elemento decorativo de fondo, y el coste por frame escala con el area del
 * canvas —que aqui es la pantalla entera—, no con el tamano del objeto.
 */
export function detectQuality(): QualityTier {
  const cores = navigator.hardwareConcurrency ?? 8;
  const compacto = isMobileViewport();
  const modesto = compacto || cores <= 4;

  if (modesto) {
    return {
      isMobile: true,
      // MSAA es desproporcionadamente caro en GPUs tiler; se compensa bajando el dpr.
      antialias: false,
      dprCap: 1.25,
      maxPixels: 9e5,
      deriva: false,
      compacto,
    };
  }

  return {
    isMobile: false,
    antialias: true,
    // 1.5 en vez de 2: en pantallas HiDPI, el salto a dpr 2 cuadruplica el
    // trabajo de fragment shader del fondo a pantalla completa y en un objeto
    // de fondo desenfocado no se distingue.
    dprCap: 1.5,
    maxPixels: 1.8e6,
    deriva: true,
    compacto: false,
  };
}
