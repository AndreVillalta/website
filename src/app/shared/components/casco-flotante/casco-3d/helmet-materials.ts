import * as THREE from 'three';

/** Mismo archivo que usa el header: una sola fuente de verdad para la marca. */
const ISOTIPO_URL = '/logo-header-mobile.svg';

/**
 * Material del isotipo.
 *
 * Va sin iluminar (`MeshBasicMaterial`) a proposito: el GLB del casco trae la
 * luz horneada en su textura emisiva y no responde a luces, asi que un material
 * PBR aqui seria la unica cosa de la escena que necesita un rig de luces
 * completo para verse — un coste desproporcionado para un decal. Sin luces, el
 * logo se atenua con `color`, que es lo que hace `encuadre.luz`.
 *
 * La carga es asincrona y la textura arranca vacia: con el bucle de render
 * corriendo, el logo aparece solo en cuanto el SVG decodifica, sin necesidad de
 * bloquear el armado del casco esperandolo. Devuelve null si el documento no
 * esta disponible (SSR) o el canvas 2D no se pudo crear; el casco sigue siendo
 * valido sin el logo en ese caso.
 */
export function createLogoMaterial(): THREE.MeshBasicMaterial | null {
  if (typeof document === 'undefined') return null;

  const w = 512;
  const h = 384;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const img = new Image();
  img.onload = () => {
    // `contain`: el viewBox del SVG trae aire alrededor del monograma y
    // deformarlo para llenar el plano lo dejaria torcido
    const escala = Math.min(w / img.width, h / img.height);
    const dw = img.width * escala;
    const dh = img.height * escala;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    texture.needsUpdate = true;
  };
  img.onerror = () => {
    // sin logo el casco sigue siendo valido; no vale la pena romper la escena
  };
  img.src = ISOTIPO_URL;

  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    // el casco tampoco pasa por ACES: si el logo si lo hiciera, se despegaria
    // del tono de la superficie sobre la que esta pegado
    toneMapped: false,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

export function radialGradientTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0.0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.42)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.08)');
    gradient.addColorStop(1.0, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
