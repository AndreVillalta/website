import * as THREE from 'three';

export interface BackgroundHandle {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  dispose(): void;
}

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform float uProgress;
uniform float uTime;
uniform float uAspect;
uniform float uHalo;
uniform vec2  uFocus;
uniform vec3  uA;
uniform vec3  uB;
uniform vec3  uC;
uniform vec3  uBlue;
uniform vec3  uGold;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  float t = uProgress;

  vec3 base = mix(uA, uB, smoothstep(0.0, 0.55, t));
  base = mix(base, uC, smoothstep(0.45, 1.0, t));
  base *= 0.78 + 0.22 * uv.y;

  vec2 f = (uFocus - 0.5) * vec2(uAspect, 1.0);
  float d = length(p - f);
  float halo = exp(-d * d * 3.2);
  vec3 haloCol = mix(uBlue, uGold, smoothstep(0.25, 0.85, t));
  base += haloCol * halo * uHalo * (0.34 + 0.10 * sin(uTime * 0.4));

  base *= 1.0 - 0.35 * smoothstep(0.35, 1.05, length(p));

  // Sin dither, un degradado tan oscuro hace banding visible en pantallas de 8 bits.
  base += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;

  gl_FragColor = vec4(max(base, 0.0), 1.0);
  #include <colorspace_fragment>
}
`;

export function createBackground(): BackgroundHandle {
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    // Los colores del fondo son tokens de diseno, no radiancia de escena: pasarlos
    // por ACES aplasta #0b0d12 a negro puro y se pierden degradado, aurora y
    // vineta. Sin tone mapping el token llega a pantalla tal cual se definio.
    toneMapped: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uHalo: { value: 1 },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uA: { value: new THREE.Color(0x0b0d12) },
      uB: { value: new THREE.Color(0x101420) },
      uC: { value: new THREE.Color(0x161b29) },
      uBlue: { value: new THREE.Color(0x537aaf) },
      uGold: { value: new THREE.Color(0xc89a3c) },
    },
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(mesh);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    scene,
    camera,
    material,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
