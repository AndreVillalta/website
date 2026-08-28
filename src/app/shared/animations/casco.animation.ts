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

/**
 * Anclaje del casco en viewports angostos (<768px).
 *
 * En movil el casco se renderiza centrado en la pantalla —`quality.ts` apaga
 * la deriva lateral porque no hay ancho donde derivar— y en el Hero eso lo
 * dejaba justo encima del titular: ni el objeto ni el texto se leian. Aca el
 * Hero parte la pantalla en dos bandas: el texto arranca pegado al header y el
 * casco baja a ocupar el resto, mas grande y a plena luz, para que la marca
 * tenga presencia propia en vez de disputarle los pixeles al titular.
 *
 * Solo el acto 00 se mueve: el resto sigue centrado como hasta ahora, y por
 * eso los valores que faltan caen al comportamiento anterior.
 *
 * `.hero` reserva la banda de abajo en CSS (ver `acto-00-hero.css`); estos
 * numeros son la otra mitad del mismo acuerdo y hay que moverlos juntos.
 */
const ANCLA_COMPACTA: Record<string, Partial<Encuadre>> = {
  // y en unidades de viewport y hacia abajo (Y+ es arriba): el centro del
  // casco cae al ~76 % del alto, dentro del hueco que deja el bloque de texto.
  'acto-00': { y: -26, scale: 1.3, luz: 1, halo: 1.15 },
};

/** Alto de viewport a partir del cual el Hero entra completo en dos bandas. */
const ALTO_COMODO = 780;
/** Por debajo de este alto la banda libre ya no da ni para el piso del casco. */
const ALTO_MINIMO = 480;

/**
 * En pantallas cortas —un iPhone SE ronda los 667px— el bloque de texto se
 * come casi todo el alto y la banda libre se angosta mucho mas rapido de lo
 * que se acorta la pantalla: el texto ocupa lo que ocupa, y lo que se pierde
 * sale entero del hueco de abajo. De ahi que la caida no sea proporcional al
 * alto sino al alto *sobrante*, y que a 667px el casco quede bastante mas
 * chico que la regla de tres. El piso evita que se vuelva un adorno.
 *
 * Lo que aun asi se cruce con la bajada queda cubierto por el velo del Hero:
 * es la misma degradacion que hace la referencia, el objeto pasa a fondo en
 * vez de desaparecer.
 */
function ajustePorAlto(): number {
  const sobrante = (window.innerHeight - ALTO_MINIMO) / (ALTO_COMODO - ALTO_MINIMO);
  return Math.min(1, Math.max(0.62, sobrante));
}

/**
 * Encuadre efectivo en movil: centrado en X —no hay ancho para derivar— con
 * el anclaje del acto encima, si lo tiene.
 */
function encuadreCompacto(id: string, encuadre: Encuadre): gsap.TweenVars {
  const base = {
    x: 0,
    y: 0,
    rotateY: 0,
    scale: encuadre.scale * 0.95,
    luz: encuadre.luz * 0.85,
    halo: encuadre.halo,
  };

  const ancla = ANCLA_COMPACTA[id];
  if (!ancla) return base;

  return { ...base, ...ancla, scale: (ancla.scale ?? base.scale) * ajustePorAlto() };
}

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

  // Tres composiciones posibles: escritorio con deriva, movil con el casco
  // anclado abajo, y el caso intermedio —equipo modesto en pantalla ancha—
  // que se queda quieto en el centro.
  let apertura: gsap.TweenVars = inicial;
  if (!escena.deriva) {
    apertura = escena.compacto
      ? encuadreCompacto('acto-00', inicial)
      : { ...inicial, x: 0, y: 0, rotateY: 0 };
  }
  gsap.set(escena.encuadre, apertura);

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

  // Sin deriva el casco no se corre de lugar: solo cambian luz, escala y halo
  // —salvo en movil, donde `encuadreCompacto` ademas lo ancla (ver arriba).
  let vars: gsap.TweenVars = { ...encuadre };
  if (!escena.deriva) {
    vars = escena.compacto
      ? encuadreCompacto(id, encuadre)
      : { scale: encuadre.scale * 0.95, luz: encuadre.luz * 0.85, halo: encuadre.halo };
  }

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
