// ------------------------
// CONFIG (EDIT THESE)
// ------------------------

// Asset-1 + Asset-2 should look like your “simple” setup:
const ASSET1_METALNESS = 0.6;
const ASSET1_ROUGHNESS = 0.6;

const ASSET2_METALNESS = 0.65;  // keep <= 1.0
const ASSET2_ROUGHNESS = 2;
const ASSET2_TINT = "#ff126d";

// Asset-4 should look like the “glitter” setup:
const ASSET4_METALNESS = 0.9;
const ASSET4_ROUGHNESS = 0.7;
const ASSET4_ENV_INTENSITY = 0.3;

// Glitter texture controls
const GLITTER_SIZE = 1024;
const GLITTER_DENSITY = 0.015;
const GLITTER_CONTRAST = 2.2;
const GLITTER_NORMAL_STRENGTH = 0.35;
const GLITTER_REPEAT = 12;

// Stack layout
const STACK_OFFSET = -0.02;
const ASSET4_Y_OFFSET = 0.252;

// LIGHT CONTROLS
const KEY_INTENSITY = 1;
const FILL_INTENSITY = 0.6;

// Files
const HDR_URL = "spruit_sunrise_1k.hdr";
const ASSET1_URL = "./models/Asset-1.gltf";
const ASSET2_URL = "./models/Asset-2.gltf";
const ASSET4_URL = "./models/Asset-5.gltf";

// ---- PENDULUM SETTINGS (bigger + smoother) ----
const SWING_MAX_DEG = 40;
const HANG_LENGTH = 0.24;

const MOUSE_SMOOTH = 0.09;
const SPRING_TORQUE = 0.008;
const DAMPING = 0.85;
const MAX_ANG_VEL = 0.12;

// Fixed anchor placement
const ANCHOR_X = 0.0;
const ANCHOR_Y = 0.22;
const ANCHOR_Z = 0.0;

// ---- DROP-IN (GRAVITY) SETTINGS ----
const DROP_START_OFFSET = 0.22;
const DROP_GRAVITY = 0.0022;
const DROP_DAMPING = 0.78;
const DROP_SETTLE_EPS = 0.0006;

// ---- TILT SETTINGS (based on mouse distance from center) ----
const TILT_MAX_DEG = 50;     // increase for stronger tilt
const TILT_SMOOTH = 0.12;    // higher = snappier tilt, lower = smoother



// ------------------------
// Radio navigation
// ------------------------
const radios = document.querySelectorAll('input[name="viewMode"]');
radios.forEach((radio) => {
  radio.addEventListener("change", function () {
    if (!this.checked) return;

    if (this.value === "gothic") {
      window.location.href = "https://lakeishaa.github.io/selects2/gothic/index.html";
    } else if (this.value === "chrome") {
      window.location.href = "https://lakeishaa.github.io/selects2/chrome/index.html";
    } else if (this.value === "barbie") {
      window.location.href = "https://lakeishaa.github.io/selects2/barbie/index.html";
    } else {
      window.location.href = "https://lakeishaa.github.io/selects2/";
    }
  });
});



// ------------------------
// Three.js imports
// ------------------------
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";



// ------------------------
// Scene / Camera / Renderer
// ------------------------
const scene = new THREE.Scene();

const anchor = new THREE.Group();
scene.add(anchor);

const arm = new THREE.Group();
anchor.add(arm);

const modelGroup = new THREE.Group();
arm.add(modelGroup);

const camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.05, -0.05, 1);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;

const container = document.getElementById("container3D");
if (!container) console.error("Missing #container3D element in HTML.");
container?.appendChild(renderer.domElement);



// ------------------------
// Controls
// ------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 10;



// ------------------------
// Lighting (camera-following)
// ------------------------
const dirLight = new THREE.DirectionalLight(0xffffff, KEY_INTENSITY);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xffffff, FILL_INTENSITY);
scene.add(fillLight);



// ------------------------
// Helpers: apply materials
// ------------------------
function setMeshMaterial(mesh, material) {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(() => material.clone());
  } else {
    mesh.material = material;
  }
  mesh.material.needsUpdate = true;
}

function applyMaterialFactory(object3D, materialFactory) {
  object3D.traverse((child) => {
    if (child.isMesh) setMeshMaterial(child, materialFactory(child));
  });
}

function applySimpleMaterial(object3D, { roughness, metalness, tint }) {
  const tintColor = new THREE.Color(tint);
  applyMaterialFactory(object3D, () => {
    return new THREE.MeshStandardMaterial({
      metalness,
      roughness,
      color: tintColor,
    });
  });
}



// ------------------------
// Glitter textures
// ------------------------
function makeGlitterTextures({
  size = 1024,
  density = 0.015,
  contrast = 2.2,
} = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, size, size);

  const flakeCount = Math.floor(size * size * density);

  for (let i = 0; i < flakeCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const b = Math.pow(Math.random(), 1 / contrast) * 255;
    const r = Math.random() * 1.5 + 0.3;

    ctx.fillStyle = `rgb(${b},${b},${b})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const flakeTex = new THREE.CanvasTexture(c);
  flakeTex.wrapS = flakeTex.wrapT = THREE.RepeatWrapping;
  flakeTex.repeat.set(GLITTER_REPEAT, GLITTER_REPEAT);
  flakeTex.needsUpdate = true;

  const n = document.createElement("canvas");
  n.width = n.height = size;
  const nctx = n.getContext("2d");

  const imgData = nctx.createImageData(size, size);
  const data = imgData.data;
  const src = ctx.getImageData(0, 0, size, size).data;

  for (let p = 0; p < size * size; p++) {
    const i = p * 4;
    const v = src[i] / 255;

    const dx = (Math.random() * 2 - 1) * v;
    const dy = (Math.random() * 2 - 1) * v;

    const nx = 0.5 + dx * 0.5;
    const ny = 0.5 + dy * 0.5;
    const nz = 1.0;

    data[i]     = Math.max(0, Math.min(255, nx * 255));
    data[i + 1] = Math.max(0, Math.min(255, ny * 255));
    data[i + 2] = Math.max(0, Math.min(255, nz * 255));
    data[i + 3] = 255;
  }

  nctx.putImageData(imgData, 0, 0);

  const normalTex = new THREE.CanvasTexture(n);
  normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(GLITTER_REPEAT, GLITTER_REPEAT);
  normalTex.needsUpdate = true;

  return { flakeTex, normalTex };
}



// ------------------------
// GLTF Loader Helper
// ------------------------
function loadGLTF(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      (xhr) => {
        if (xhr.total) console.log(`${url}: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`);
      },
      (err) => reject(err)
    );
  });
}



// ------------------------
// Pendulum input
// ------------------------
let angle = 0;
let angVel = 0;

let mouseTarget = 0;
let smoothTarget = 0;

// NEW: store mouse distance from center for tilt
let mouseNX = 0;        // [-1..1]
let smoothNX = 0;       // smoothed

window.addEventListener("mousemove", (e) => {
  mouseNX = (e.clientX / window.innerWidth) * 2 - 1; // [-1, 1]

  const maxRad = THREE.MathUtils.degToRad(SWING_MAX_DEG);
  mouseTarget = mouseNX * maxRad;
});



// ------------------------
// DROP-IN state
// ------------------------
let dropActive = true;
let dropY = 0;
let dropV = 0;

let FINAL_HANG_Y = -HANG_LENGTH;
let START_HANG_Y = FINAL_HANG_Y + DROP_START_OFFSET;



// ------------------------
// HDR + Models
// ------------------------
new RGBELoader()
  .setPath("textures/equirectangular/")
  .load(
    HDR_URL,
    async (hdrTexture) => {
      hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdrTexture;

      const { flakeTex, normalTex } = makeGlitterTextures({
        size: GLITTER_SIZE,
        density: GLITTER_DENSITY,
        contrast: GLITTER_CONTRAST,
      });

      const loader = new GLTFLoader();

      try {
        const [asset1, asset2, asset4] = await Promise.all([
          loadGLTF(loader, ASSET1_URL),
          loadGLTF(loader, ASSET2_URL),
          loadGLTF(loader, ASSET4_URL),
        ]);

        applySimpleMaterial(asset1, {
          roughness: ASSET1_ROUGHNESS,
          metalness: ASSET1_METALNESS,
          tint: 0xffffff,
        });

        applySimpleMaterial(asset2, {
          roughness: ASSET2_ROUGHNESS,
          metalness: Math.min(ASSET2_METALNESS, 1.0),
          tint: ASSET2_TINT,
        });

        applyMaterialFactory(asset4, () => {
          return new THREE.MeshStandardMaterial({
            envMap: hdrTexture,
            envMapIntensity: ASSET4_ENV_INTENSITY,
            metalness: ASSET4_METALNESS,
            roughness: ASSET4_ROUGHNESS,
            color: 0xffffff,
            normalMap: normalTex,
            normalScale: new THREE.Vector2(GLITTER_NORMAL_STRENGTH, GLITTER_NORMAL_STRENGTH),
            roughnessMap: flakeTex,
          });
        });

        asset1.position.set(0, 0, 0);
        asset2.position.set(0, 0, STACK_OFFSET);
        asset4.position.set(0, ASSET4_Y_OFFSET, STACK_OFFSET);

        modelGroup.add(asset2);
        modelGroup.add(asset4);
        modelGroup.add(asset1);

        // Fixed anchor
        anchor.position.set(ANCHOR_X, ANCHOR_Y, ANCHOR_Z);

        // Drop init
        FINAL_HANG_Y = -HANG_LENGTH;
        START_HANG_Y = FINAL_HANG_Y + DROP_START_OFFSET;

        dropY = START_HANG_Y;
        dropV = 0;
        dropActive = true;

        modelGroup.position.set(0, dropY, 0);

      } catch (err) {
        console.error("GLTF Load Error:", err);
      }
    },
    undefined,
    (err) => console.error("HDR Load Error:", err)
  );



// ------------------------
// Resize
// ------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// ------------------------
// Animate
// ------------------------
function animate() {
  requestAnimationFrame(animate);

  // Camera-follow lights
  dirLight.position.copy(camera.position);
  dirLight.position.z += 2;

  fillLight.position.copy(camera.position);
  fillLight.position.x -= 2;
  fillLight.position.y -= 1;

  // Drop-in
  if (dropActive) {
    dropV -= DROP_GRAVITY;
    dropY += dropV;

    if (dropY <= FINAL_HANG_Y) {
      dropY = FINAL_HANG_Y;
      dropV = -dropV * DROP_DAMPING;
    }

    modelGroup.position.y = dropY;

    if (Math.abs(dropV) < DROP_SETTLE_EPS && Math.abs(dropY - FINAL_HANG_Y) < 0.0005) {
      dropActive = false;
      modelGroup.position.y = FINAL_HANG_Y;
      dropV = 0;
    }
  } else {
    modelGroup.position.y = FINAL_HANG_Y;
  }

  // Smooth mouse target for swing
  smoothTarget = THREE.MathUtils.lerp(smoothTarget, mouseTarget, MOUSE_SMOOTH);

  // Pendulum torque
  const torque = (smoothTarget - angle) * SPRING_TORQUE;
  angVel += torque;

  angVel = THREE.MathUtils.clamp(angVel, -MAX_ANG_VEL, MAX_ANG_VEL);
  angVel *= DAMPING;
  angle += angVel;

  arm.rotation.z = angle;

  // ---- NEW TILT: more distance from center = more tilt ----
  // Smooth nx to avoid jitter
  smoothNX = THREE.MathUtils.lerp(smoothNX, mouseNX, MOUSE_SMOOTH);

  // Magnitude of tilt depends on distance from center (abs)
  const tiltMaxRad = THREE.MathUtils.degToRad(TILT_MAX_DEG);
  const tiltAmount = Math.min(Math.abs(smoothNX), 1) * tiltMaxRad;

  // Keep sign so it tilts into the direction of mouse
  const targetTilt = (smoothNX >= 0 ? 1 : -1) * tiltAmount;

  // Smooth tilt separately (nice feel)
  const currentTilt = modelGroup.rotation.y;
  modelGroup.rotation.y = THREE.MathUtils.lerp(currentTilt, targetTilt, TILT_SMOOTH);

  controls.update();
  renderer.render(scene, camera);
}
animate();
