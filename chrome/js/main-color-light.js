// Import Three.js and required modules
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Create a scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 5);

// Create a WebGL renderer with a transparent background
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById("container3D").appendChild(renderer.domElement);

// Set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 10;

// Load an HDR environment map
new RGBELoader()
  .setPath("textures/equirectangular/")
  .load("royal_esplanade_1k.hdr", (texture) => {
    // .load("quarry_01_1k.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    // Apply the environment map only to the objects, not the scene background
    scene.environment = texture;

    // Load the 3D text object
    const loader = new GLTFLoader();
    loader.load(
      `./models/text3.gltf`,
      (gltf) => {
        const textObject = gltf.scene;

        // Apply a reflective material to the text object
        textObject.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              envMap: texture,
              metalness: 1,
              roughness: 0.5,
            });
          }
        });

        scene.add(textObject);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error(error);
      }
    );
  });

// Add a directional light
const dirLight = new THREE.DirectionalLight("0xffffff", 1);
dirLight.position.set(0, 0, 5); // Initial light position
scene.add(dirLight);

// Track mouse position
const mouse = new THREE.Vector2();

// Add event listener for mouse movement
window.addEventListener("mousemove", (event) => {
  // Normalize mouse position to range [-1, 1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the light position
  const lightDistance = 1; // Adjust the distance of the light
  dirLight.position.set(mouse.x * lightDistance, mouse.y * lightDistance, 5);
});

////////remove this to not change color
// window.addEventListener("mousemove", (event) => {
//   // Normalize mouse position to range [-1, 1]
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   // Update the light position
//   const lightDistance = 10; // Adjust the distance of the light
//   dirLight.position.set(mouse.x * lightDistance, mouse.y * lightDistance, 5);

//   // Change light color dynamically based on mouse position
//   const r = Math.abs(mouse.x);
//   const g = Math.abs(mouse.y);
//   const b = Math.abs(mouse.x + mouse.y) / 2;
//   dirLight.color.setRGB(r, g, b); // Set light color
// });

// Handle window resize
window.addEventListener("resize", () => {
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Log updated dimensions for debugging
  console.log(`Renderer resized: ${window.innerWidth}x${window.innerHeight}`);
});

// Animate and render the scene
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
