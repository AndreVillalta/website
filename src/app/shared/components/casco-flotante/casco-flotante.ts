import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { observarActoActivo } from '../../animations/acto-activo';
import { activarSnapScroll } from '../../animations/acto-snap';
import { activarCasco, irAlActo } from '../../animations/casco.animation';
import { prefersReducedMotion } from '../../animations/gsap-core';
import { ACTOS } from '../rail-scroll/rail-scroll';
import type { CascoEscena } from './casco-3d/scene';

/**
 * El casco blanco: unico objeto protagonista, fijo detras de todo el contenido.
 *
 * Es un modelo 3D, no un video: el fondo de la pagina se pinta dentro del mismo
 * canvas, asi que no hay dos superficies que empalmar y el objeto deja de leerse
 * como un rectangulo recortado sobre el carbon.
 *
 * Es puramente decorativo (`aria-hidden`), asi que no aporta nada al arbol de
 * accesibilidad. Three entra por import dinamico para no competir con el LCP
 * —que es el H1 del Hero, en texto— y el video original queda como respaldo
 * para el puñado de equipos sin WebGL.
 */
@Component({
  selector: 'app-casco-flotante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './casco-flotante.html',
  styleUrl: './casco-flotante.css',
})
export class CascoFlotante implements OnDestroy {
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly listo = signal(false);
  protected readonly conWebgl = signal(true);

  private escena?: CascoEscena;
  private observadorTamano?: ResizeObserver;
  private cleanup?: () => void;
  /** `ngOnDestroy` corre tambien en SSR al cerrar cada request; sin esta
   * bandera intentaria quitar un listener que ahi nunca se llego a poner. */
  private escuchandoVisibilidad = false;

  private readonly alCambiarVisibilidad = (): void => {
    if (document.visibilityState === 'hidden') this.escena?.stop();
    else this.escena?.start();
  };

  constructor() {
    afterNextRender(() => this.programarInicio());
  }

  /**
   * Nada de 3D antes del `load`.
   *
   * El LCP es el H1 del Hero, que llega prerenderizado y no necesita JS. Si el
   * casco arranca de inmediato, el chunk de three, el GLB de 1.6 MB y la
   * compilacion de shaders compiten por red y por hilo principal justo en la
   * ventana que Lighthouse mide. Diferirlo cuesta que el casco aparezca unas
   * decimas mas tarde y no cambia nada mas: es decorativo.
   */
  private programarInicio(): void {
    const arrancar = () => void this.iniciar();

    if (document.readyState === 'complete') {
      arrancar();
      return;
    }
    window.addEventListener('load', arrancar, { once: true });
  }

  private async iniciar(): Promise<void> {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const { crearEscenaCasco } = await import('./casco-3d/scene');
    const reducido = prefersReducedMotion();

    const escena = crearEscenaCasco(canvas, { movimientoReducido: reducido });
    if (!escena) {
      this.conWebgl.set(false);
      return;
    }
    this.escena = escena;

    canvas.addEventListener('webglcontextlost', (evento) => {
      evento.preventDefault();
      escena.stop();
      this.conWebgl.set(false);
    });

    // El canvas puede medir 0 si se lo observa antes de que el layout lo haya
    // colocado. Cuando eso pasa, `resize` corta por lo sano y no encuadra la
    // camara, y si el ResizeObserver no vuelve a avisar —solo avisa cuando el
    // tamano *cambia*— la escena se queda sin encuadrar para siempre: camara
    // en el origen, dentro del casco, pantalla negra.
    //
    // El viewport es la medida correcta y no una estimacion: `.escenario` es
    // `position: fixed; inset: 0`, asi que el canvas siempre lo ocupa entero.
    const medir = () => {
      escena.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    };

    this.observadorTamano = new ResizeObserver(medir);
    this.observadorTamano.observe(canvas);
    medir();
    this.listo.set(true);

    // Con movimiento reducido queda un unico fotograma quieto. Hay que pintarlo:
    // a diferencia del video, un canvas sin bucle se queda en negro.
    if (reducido) {
      escena.renderOnce();
      return;
    }

    document.addEventListener('visibilitychange', this.alCambiarVisibilidad);
    this.escuchandoVisibilidad = true;
    escena.start();

    const cleanupCasco = await activarCasco({ escena });

    // El primer aviso del observador coincide con el encuadre inicial que
    // `activarCasco` ya dejo puesto (acto-00): se ignora para no animar
    // desde el mismo estado hacia si mismo.
    let primerAviso = true;
    const ids = ACTOS.map((acto) => acto.id);
    const detenerObservador = observarActoActivo(ids, (indice) => {
      if (primerAviso) {
        primerAviso = false;
        return;
      }
      void irAlActo(escena, indice);
    });

    const detenerSnap = await activarSnapScroll(ids);

    this.cleanup = () => {
      cleanupCasco();
      detenerObservador();
      detenerSnap();
    };
  }

  ngOnDestroy(): void {
    this.cleanup?.();
    this.observadorTamano?.disconnect();
    if (this.escuchandoVisibilidad) {
      document.removeEventListener('visibilitychange', this.alCambiarVisibilidad);
    }
    this.escena?.dispose();
  }
}
