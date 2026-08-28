import * as THREE from 'three';
import { buildHelmet } from './helmet-gltf';
import { radialGradientTexture } from './helmet-materials';
import { createBackground } from './background-shader';
import { detectQuality } from './quality';

/**
 * Encuadre del casco en un acto. Son los mismos campos que manejaba la version
 * en video, para que el recorrido autoral se conserve tal cual.
 */
export interface EncuadreVivo {
  x: number;
  y: number;
  rotateY: number;
  scale: number;
  /** 1 = plena luz, 0 = hundido en el fondo. */
  luz: number;
  halo: number;
}

export interface CascoEscena {
  /** Si false, el equipo no aguanta la deriva lateral y el casco se queda centrado. */
  readonly deriva: boolean;
  /**
   * Viewport angosto (<768px). No es lo mismo que `!deriva`: un portatil de
   * pocos nucleos tampoco deriva, pero conserva la composicion de escritorio.
   * Ver `quality.ts`.
   */
  readonly compacto: boolean;
  /**
   * GSAP escribe aca directamente y el bucle rAF lo lee. Sin callbacks por
   * frame: el scroll y el render corren a frecuencias distintas.
   */
  readonly encuadre: EncuadreVivo;
  setProgreso(progreso: number): void;
  resize(width: number, height: number): void;
  start(): void;
  stop(): void;
  renderOnce(): void;
  dispose(): void;
}

const FOV = 28;
const RADIO_CASCO = 1.46;
/** Fraccion de la dimension menor del viewport que ocupa el casco. */
const OCUPACION = 0.56;
const YAW_BASE = -0.5;
const PITCH_BASE = 0.18;
const VUELTAS = 1.25;
const PROGRESO_QUIETO = 0.15;

export const ENCUADRE_INICIAL: EncuadreVivo = {
  x: 8,
  y: 0,
  rotateY: 2,
  scale: 1,
  luz: 1,
  halo: 1,
};

export function crearEscenaCasco(
  canvas: HTMLCanvasElement,
  opts: { movimientoReducido: boolean },
): CascoEscena | null {
  const q = detectQuality();

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: q.antialias,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
  } catch {
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  // Sin sombras ni rig de luces ni environment PMREM: el GLB trae la
  // iluminacion horneada en su textura emisiva con baseColor negro, asi que no
  // responde a luces —medido: apagarlas todas junto con el environment cambia
  // el casco 0.71/255 por canal, imperceptible— y no hay suelo que reciba
  // sombra. Eran un shadow map de 1024 y un PMREM de 256 por cada frame y por
  // cada arranque, sin aportar un pixel.
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 100);

  // El grupo del casco arranca vacio: `buildHelmet` es async (carga un GLB
  // por red) y el modelo se agrega recien cuando resuelve, mas abajo. Asi el
  // bucle de render no espera a la red — el fondo pinta desde el primer frame.
  const helmetGroup = new THREE.Group();
  helmetGroup.name = 'helmet-wrapper';

  // El carrier lleva traslacion y escala; el grupo del casco lleva la rotacion.
  // Separarlos evita que el halo orbite hacia delante cuando el casco gira.
  const carrier = new THREE.Group();
  carrier.add(helmetGroup);
  scene.add(carrier);

  const haloTexture = radialGradientTexture();
  const haloMaterial = new THREE.SpriteMaterial({
    map: haloTexture,
    color: 0xfff0d8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.22,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.setScalar(3.4);
  halo.position.z = -1.2;
  carrier.add(halo);

  const bg = createBackground();

  const haloBase = haloMaterial.opacity;

  const encuadre: EncuadreVivo = { ...ENCUADRE_INICIAL };
  let progreso = opts.movimientoReducido ? PROGRESO_QUIETO : 0;

  const timer = new THREE.Timer();
  const proyectado = new THREE.Vector3();
  let vw = 0.01;
  let vh = 0.01;
  let raf = 0;
  let corriendo = false;
  let liberado = false;
  let cascoDisposables: { dispose(): void }[] = [];

  /**
   * Lo que `encuadre.luz` atenua de verdad: `emissiveIntensity` de los
   * materiales del GLB (unico control que oscurece el casco) y el `color` del
   * decal del isotipo, que no tiene emisivo propio.
   */
  let emisivos: THREE.MeshStandardMaterial[] = [];
  let logoMat: THREE.MeshBasicMaterial | null = null;

  buildHelmet()
    .then((casco) => {
      if (liberado) {
        // el componente se destruyo antes de que el GLB terminara de cargar
        for (const entrada of casco.disposables) entrada.dispose();
        return;
      }
      helmetGroup.add(casco.group);
      cascoDisposables = casco.disposables;
      emisivos = casco.emisivos;
      logoMat = casco.logo;
    })
    .catch(() => {
      // sin el modelo el casco no aparece esta vez; el fondo reactivo sigue andando
    });

  function encuadrarCamara(aspect: number) {
    camera.aspect = aspect;
    let distancia = RADIO_CASCO / OCUPACION / Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
    if (aspect < 1) distancia /= aspect;
    camera.position.set(0, 0, distancia);
    camera.updateProjectionMatrix();

    // vw/vh convierten los offsets autorales (escritos en vw/vh, como en la
    // version en video) a unidades de mundo en el plano del casco. Asi el
    // recorrido no hay que reescribirlo cuando cambia el tamano de ventana.
    const altoVisible = 2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2) * distancia;
    vh = altoVisible / 100;
    vw = (altoVisible * aspect) / 100;
  }

  function dibujar() {
    timer.update();
    const t = opts.movimientoReducido ? 0 : timer.getElapsed();

    carrier.position.x = encuadre.x * vw;
    carrier.position.y = encuadre.y * vh + Math.sin(t * 0.55) * 0.045;
    carrier.scale.setScalar(encuadre.scale);

    helmetGroup.rotation.y =
      YAW_BASE +
      progreso * Math.PI * 2 * VUELTAS +
      THREE.MathUtils.degToRad(encuadre.rotateY) +
      Math.sin(t * 0.23) * 0.035;
    helmetGroup.rotation.x = PITCH_BASE + Math.sin(progreso * Math.PI * 2) * 0.1;
    helmetGroup.rotation.z = Math.sin(t * 0.37) * 0.03;

    for (const mat of emisivos) mat.emissiveIntensity = encuadre.luz;
    if (logoMat) logoMat.color.setScalar(encuadre.luz);
    haloMaterial.opacity = haloBase * encuadre.halo;

    proyectado.copy(carrier.position).project(camera);
    const u = bg.material.uniforms;
    (u['uFocus'].value as THREE.Vector2).set(
      proyectado.x * 0.5 + 0.5,
      proyectado.y * 0.5 + 0.5,
    );
    u['uProgress'].value = progreso;
    u['uTime'].value = t;
    u['uHalo'].value = encuadre.halo;

    renderer.clear();
    renderer.render(bg.scene, bg.camera);
    renderer.render(scene, camera);
  }

  function bucle() {
    dibujar();
    raf = requestAnimationFrame(bucle);
  }

  // Encuadre de arranque. `encuadrarCamara` solo corria desde `resize`, asi que
  // hasta el primer aviso de tamano la camara se quedaba en el origen —dentro
  // del casco, con `vw`/`vh` en 0.01— y no habia nada que ver. Normalmente ese
  // aviso llega enseguida y no se nota; cuando no llega (canvas medido en 0 al
  // observarlo, y el ResizeObserver solo vuelve a avisar si el tamano cambia)
  // el negro era definitivo. Encuadrar aca hace que el peor caso sea un
  // aspecto momentaneamente inexacto en vez de una pantalla vacia.
  const aspectoInicial = window.innerWidth / window.innerHeight || 1;
  encuadrarCamara(aspectoInicial);
  bg.material.uniforms['uAspect'].value = aspectoInicial;

  return {
    deriva: q.deriva,
    compacto: q.compacto,
    encuadre,

    setProgreso(valor: number) {
      progreso = valor;
    },

    resize(width: number, height: number) {
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, q.dprCap);
      const escala = Math.min(1, Math.sqrt(q.maxPixels / (width * height * dpr * dpr)));
      renderer.setPixelRatio(dpr * escala);
      // El `false` importa: el CSS controla el tamano del canvas, Three solo el backing store.
      renderer.setSize(width, height, false);
      const aspect = width / height;
      encuadrarCamara(aspect);
      bg.material.uniforms['uAspect'].value = aspect;
      if (!corriendo) dibujar();
    },

    start() {
      if (corriendo || liberado) return;
      corriendo = true;
      raf = requestAnimationFrame(bucle);
    },

    stop() {
      if (!corriendo) return;
      corriendo = false;
      cancelAnimationFrame(raf);
    },

    renderOnce() {
      if (!liberado) dibujar();
    },

    dispose() {
      if (liberado) return;
      liberado = true;
      corriendo = false;
      cancelAnimationFrame(raf);

      scene.traverse((objeto) => {
        const mesh = objeto as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const material = mesh.material;
        for (const entrada of Array.isArray(material) ? material : [material]) entrada.dispose();
      });

      for (const entrada of cascoDisposables) entrada.dispose();
      haloTexture.dispose();
      haloMaterial.dispose();
      bg.dispose();

      renderer.dispose();
      // Libera el contexto de GPU en el acto: los navegadores toleran ~8-16 vivos
      // y este componente se destruye al navegar a /portal.
      renderer.forceContextLoss();
    },
  };
}
