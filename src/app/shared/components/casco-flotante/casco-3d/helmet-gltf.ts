import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createLogoMaterial } from './helmet-materials';

export interface HelmetParts {
  group: THREE.Group;
  shell: THREE.Mesh;
  /**
   * Materiales cuyo `emissiveIntensity` responde a `encuadre.luz`. El GLB trae
   * la luz horneada en una textura emisiva con baseColor negro, asi que atenuar
   * la emision es lo unico que realmente oscurece el casco (medido: 34x mas
   * efectivo que bajar la intensidad de un rig de luces completo).
   */
  emisivos: THREE.MeshStandardMaterial[];
  /** Sin emissive propio: se atenua por `color`. */
  logo: THREE.MeshBasicMaterial | null;
  disposables: { dispose(): void }[];
}

const MODEL_URL = '/models/casco.glb';

/**
 * Radio en el que se normaliza el modelo cargado: mismo valor que `scene.ts`
 * usa para encuadrar la camara, asi el tamano en pantalla no depende de las
 * unidades en las que se exporto el GLB.
 */
const RADIO_CASCO = 1.46;

const YAW_FRENTE = -0.5;
const LOGO_ALTURA_RELATIVA = 0.42;
const LOGO_ESCALA = 0.44;

/**
 * Carga el casco real (GLB) y lo normaliza para encajar en el mismo espacio
 * que ocupaba el casco procedural: centrado en el origen, escalado a
 * `RADIO_CASCO`, con el isotipo posicionado por raycasting contra la malla
 * real en vez de una formula analitica sobre un perfil conocido.
 */
export async function buildHelmet(): Promise<HelmetParts> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(MODEL_URL);
  const root = gltf.scene;

  // --- Normalizar escala y pivote por bounding box --------------------------
  // No asumimos nada de las unidades de origen: cualquier export encaja igual.
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radioModelo = Math.max(size.x, size.z) / 2 || 1;
  const factor = RADIO_CASCO / radioModelo;

  const pivot = new THREE.Group();
  pivot.name = 'helmet-pivot';
  root.position.sub(center);
  pivot.add(root);
  pivot.scale.setScalar(factor);

  const group = new THREE.Group();
  group.name = 'helmet';
  group.add(pivot);

  // --- Materiales -------------------------------------------------------
  // El material horneado (baseColor negro + emissiveTexture) ya trae su
  // propia iluminacion de estudio: dejarlo pasar por ACES lo regrada contra
  // la exposicion de la escena y desvirtua el look de las referencias del
  // usuario, asi que se excluye del tone mapping igual que el fondo shader.
  let shell: THREE.Mesh | null = null;
  const disposables: { dispose(): void }[] = [];
  const texturasVistas = new Set<THREE.Texture>();
  const emisivos: THREE.MeshStandardMaterial[] = [];

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!shell || (mesh.geometry.attributes['position']?.count ?? 0) > (shell.geometry.attributes['position']?.count ?? 0)) {
      shell = mesh;
    }
    disposables.push(mesh.geometry);
    const materiales = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materiales) {
      disposables.push(mat);
      mat.toneMapped = false;
      const std = mat as THREE.MeshStandardMaterial;
      if (std.isMeshStandardMaterial && std.emissiveMap) emisivos.push(std);

      for (const key of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
        const tex = (mat as unknown as Record<string, THREE.Texture | undefined>)[key];
        if (tex && !texturasVistas.has(tex)) {
          texturasVistas.add(tex);
          disposables.push(tex);
        }
      }
    }
  });

  // reasignar a una const: TS no arrastra la narrowing de `shell` fuera del
  // closure de `traverse` porque no puede probar que corrio sincronicamente
  const mallaPrincipal = shell as THREE.Mesh | null;
  if (!mallaPrincipal) {
    throw new Error('El GLB del casco no contiene ninguna malla');
  }

  // --- Isotipo por raycasting -------------------------------------------
  // Sin un perfil analitico como el del torno procedural, el punto y la
  // normal de la superficie real se resuelven disparando un rayo desde
  // enfrente del casco hacia su centro aproximado.
  const logoMaterial = createLogoMaterial();
  let logoUsado: THREE.MeshBasicMaterial | null = null;
  if (logoMaterial) {
    // El pivote/escala recien armados no se propagan a matrixWorld hasta el
    // primer render: sin este update el rayo (en coordenadas ya normalizadas)
    // prueba contra una malla que todavia reporta matrices identidad y jamas
    // impacta. `group` todavia no tiene el yaw base aplicado (se fija despues
    // de esto), asi que el punto de impacto queda en el mismo espacio en el
    // que `group.add(logo)` lo va a interpretar — sin rotacion doble.
    group.updateMatrixWorld(true);

    // Un rayo horizontal a una altura fija puede pasar por encima del apice
    // sin tocar nada si se adivina mal la proporcion del modelo. Apuntar en
    // diagonal hacia el eje central es robusto a cualquier proporcion: el
    // origen queda fuera del bounding box (arriba y al frente) y el objetivo,
    // sobre el eje vertical a la altura deseada, esta garantizado dentro.
    const semiAltura = (size.y * factor) / 2;
    const alturaObjetivo = semiAltura * LOGO_ALTURA_RELATIVA;
    const objetivo = new THREE.Vector3(0, alturaObjetivo, 0);
    const origen = new THREE.Vector3(0, alturaObjetivo + semiAltura * 0.5, radioModelo * factor * 3);
    const direccion = objetivo.clone().sub(origen).normalize();
    const raycaster = new THREE.Raycaster(origen, direccion);
    const impacto = raycaster.intersectObject(mallaPrincipal, true)[0];

    if (impacto?.face) {
      const logoGeo = new THREE.PlaneGeometry(LOGO_ESCALA * 1.334, LOGO_ESCALA);
      disposables.push(logoGeo, logoMaterial);
      if (logoMaterial.map) disposables.push(logoMaterial.map);

      const logo = new THREE.Mesh(logoGeo, logoMaterial);
      const normal = impacto.face.normal.clone().transformDirection(mallaPrincipal.matrixWorld).normalize();
      logo.position.copy(impacto.point).addScaledVector(normal, 0.006);
      logo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      logo.renderOrder = 2;
      group.add(logo);
      logoUsado = logoMaterial;
    } else {
      // sin impacto no hay donde anclar el logo; el casco sigue siendo valido sin el
      logoMaterial.dispose();
      logoMaterial.map?.dispose();
    }
  }

  // El yaw base se aplica al final: todo lo anterior (raycasting, hijos
  // agregados a `group`) trabajo en el espacio sin rotar.
  group.rotation.y = YAW_FRENTE;

  return { group, shell: mallaPrincipal, emisivos, logo: logoUsado, disposables };
}
