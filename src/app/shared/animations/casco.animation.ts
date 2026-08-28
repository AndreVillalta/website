import { DURACION_SALTO, EASE_SALTO } from './acto-snap';
import { loadGsap } from './gsap-core';
import type { CascoEscena, EncuadreVivo } from '../components/casco-flotante/casco-3d/scene';

/** Estado del casco en cada acto de la pelicula. */
type Encuadre = EncuadreVivo;

/**
 * Recorrido del casco a lo largo de los seis actos.
 *
 * No es una progresion matematica: se busca que el objeto respire. Se hunde
 * en el Conflicto, vuelve a plena luz en la Solucion y cierra grande y
 * centrado, despidiendose de camara.
 *
 * `x` e `y` siguen escritos en unidades de viewport —la escena los convierte a
 * unidades de mundo— para que el recorrido se lea igual que cuando el casco
 * era un video. `luz` reemplaza a la antigua `opacity`: en un cuerpo cerrado
 * la transparencia delataria el forro interior, asi que el casco se hunde
 * bajando las luces, no volviendose translucido.
 */
const RECORRIDO: Record<string, Encuadre> = {
  // Texto a la izquierda: el casco corrido mas a la derecha (8 -> 12) le da
  // mas aire al bloque sin salirse del encuadre.
  'acto-00': { x: 25,  y: 0,  rotateY: 2,  scale: 1,    luz: 1,    halo: 1 },
  // `.bloque` solo se alinea a la derecha desde 1024px; por debajo el texto
  // queda a la izquierda igual que el casco. El rail lateral (visible desde
  // 1280px) tambien vive en esta franja izquierda: -21 quedaba escondido
  // detras del rail, no "mas al medio" como se buscaba.
  'acto-01': { x: -20, y: 2,  rotateY: -7, scale: 0.9,  luz: 0.95, halo: 0.75 },
  // Tres columnas de texto compitiendo por el mismo ancho: correrlo mas a la
  // derecha (9 -> 18) para que no se meta en la tercera columna ("Riesgo
  // invisible"). Ademas se lo encoge (0.74 -> 0.6): es el acto mas oscuro y
  // el que menos protagonismo necesita.
  'acto-02': { x: 22,  y: 12,  rotateY: 4,  scale: 0.7,  luz: 0.4,  halo: 0.2 },
  // Con los actos comprimidos a ~100vh el bloque de texto (eyebrow + titular)
  // quedo mas arriba de lo que este encuadre asumia: a escala 1.02 el casco
  // le tapaba el rotulo "03 / La solucion". Se lo achica, se lo baja (-2 ->
  // -8) y se lo corre mas a la derecha (15 -> 20) para despejar la lista.
  'acto-03': { x: 20,  y: 18, rotateY: 7,  scale: 0.8,  luz: 0.70,    halo: 1.15 },
  'acto-04': { x: -18, y: 2,  rotateY: 62, scale: 0.8,  luz: 0.55, halo: 0.4 },
  // Cierre: el casco baja y gira hasta mostrar el isotipo de frente a camara.
  // Y+ es "arriba" en esta escena (ver `scene.ts`): bajarlo es Y NEGATIVO.
  'acto-05': { x: 0,   y: -16, rotateY: -95, scale: 1.18, luz: 1,    halo: 1.35 },
};

/** Orden de lectura de los actos: mismo orden en el que se declara `RECORRIDO`. */
export const ACTO_IDS = Object.keys(RECORRIDO);

let progresoActual = 0;

export interface CascoTargets {
  escena: CascoEscena;
}

/**
 * Deja el casco listo en el encuadre inicial (acto 00). El resto del
 * recorrido lo maneja `irAlActo`, disparado cuando cambia el acto activo —ya
 * sea por un salto de scroll (`acto-snap.ts`) o por scroll libre normal
 * (`acto-activo.ts`)—, no por un scrub continuo: eso era lo que producia el
 * salto brusco al superponerse los `ScrollTrigger` de actos vecinos.
 *
 * Devuelve una funcion de limpieza (no hay listeners que quitar hoy, pero
 * mantiene la forma async/cleanup que usa el resto del modulo).
 */
export async function activarCasco(t: CascoTargets): Promise<() => void> {
  const { gsap } = await loadGsap();
  const { escena } = t;

  progresoActual = 0;
  const inicial = RECORRIDO['acto-00'];
  gsap.set(escena.encuadre, escena.deriva ? inicial : { ...inicial, x: 0, y: 0, rotateY: 0 });

  return () => {};
}

/**
 * Anima el casco desde su encuadre actual hasta el del acto destino. GSAP
 * nunca toca Three directamente: escribe en `escena.encuadre` (y, via
 * `setProgreso`, en un proxy de rotacion) y el bucle rAF lo lee.
 */
export async function irAlActo(
  escena: CascoEscena,
  indiceDestino: number,
  duracion: number = DURACION_SALTO,
  ease: string = EASE_SALTO,
): Promise<void> {
  const id = ACTO_IDS[indiceDestino];
  const encuadre = id ? RECORRIDO[id] : undefined;
  if (!encuadre) return;

  const { gsap } = await loadGsap();

  // En movil el casco se queda centrado: solo cambian luz, escala y halo.
  const vars: gsap.TweenVars = escena.deriva
    ? { ...encuadre }
    : { scale: encuadre.scale * 0.95, luz: encuadre.luz * 0.85, halo: encuadre.halo };

  gsap.to(escena.encuadre, { ...vars, duration: duracion, ease });

  const total = ACTO_IDS.length - 1;
  const destino = total === 0 ? 0 : indiceDestino / total;
  const proxy = { v: progresoActual };
  gsap.to(proxy, {
    v: destino,
    duration: duracion,
    ease,
    onUpdate: () => {
      progresoActual = proxy.v;
      escena.setProgreso(progresoActual);
    },
  });
}
