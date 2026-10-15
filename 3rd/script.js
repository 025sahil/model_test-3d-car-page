import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const canvas = document.querySelector("#car-canvas");
const stage = document.querySelector(".stage-wrap");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(7.8, 3.7, 8.8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 7.5;
controls.maxDistance = 15;
controls.minPolarAngle = Math.PI * 0.28;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0.65, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0xb8ae9b, 2.9));

const keyLight = new THREE.DirectionalLight(0xffffff, 5.5);
keyLight.position.set(-4, 8, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -7;
keyLight.shadow.camera.right = 7;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -4;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xd8ff77, 4.2);
rimLight.position.set(6, 3, -6);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xffffff, 55, 18);
fillLight.position.set(-4, 3, 5);
scene.add(fillLight);

const materials = {
  body: new THREE.MeshPhysicalMaterial({
    color: 0x282b27,
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  }),
  bodyDark: new THREE.MeshPhysicalMaterial({
    color: 0x151715,
    metalness: 0.88,
    roughness: 0.24,
    clearcoat: 0.7,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x6f7d7d,
    metalness: 0.2,
    roughness: 0.08,
    transmission: 0.25,
    transparent: true,
    opacity: 0.84,
    clearcoat: 1,
  }),
  rubber: new THREE.MeshStandardMaterial({
    color: 0x0c0d0c,
    metalness: 0.05,
    roughness: 0.72,
  }),
  wheel: new THREE.MeshStandardMaterial({
    color: 0x393c38,
    metalness: 0.92,
    roughness: 0.2,
  }),
  brake: new THREE.MeshStandardMaterial({
    color: 0xc9ee3d,
    metalness: 0.25,
    roughness: 0.35,
  }),
  light: new THREE.MeshStandardMaterial({
    color: 0xedffd0,
    emissive: 0xdbff65,
    emissiveIntensity: 4,
    roughness: 0.2,
  }),
  tailLight: new THREE.MeshStandardMaterial({
    color: 0xff2f18,
    emissive: 0xff1808,
    emissiveIntensity: 5,
  }),
  interior: new THREE.MeshStandardMaterial({
    color: 0x1b1d1a,
    roughness: 0.72,
  }),
};

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.rotation.set(...rotation);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function createSideBody() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.75, 0.18);
  shape.bezierCurveTo(-2.65, -0.04, -2.35, -0.13, -1.95, -0.15);
  shape.lineTo(1.95, -0.15);
  shape.bezierCurveTo(2.4, -0.12, 2.75, 0.03, 2.9, 0.3);
  shape.lineTo(2.65, 0.7);
  shape.bezierCurveTo(2.1, 0.91, 1.45, 0.95, 0.95, 1.02);
  shape.bezierCurveTo(0.2, 1.63, -0.35, 1.82, -1.15, 1.72);
  shape.bezierCurveTo(-1.65, 1.64, -2.06, 1.25, -2.35, 0.93);
  shape.lineTo(-2.72, 0.72);
  shape.bezierCurveTo(-2.9, 0.58, -2.88, 0.35, -2.75, 0.18);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.72,
    bevelEnabled: true,
    bevelSize: 0.14,
    bevelThickness: 0.12,
    bevelSegments: 5,
    curveSegments: 18,
  });
  geometry.translate(0, 0, -0.86);
  geometry.computeVertexNormals();
  return mesh(geometry, materials.body, [0, 0.5, 0]);
}

const car = new THREE.Group();
car.rotation.y = -0.18;
scene.add(car);

const body = createSideBody();
car.add(body);

// Lower aero surfaces and splitters.
car.add(mesh(new RoundedBoxGeometry(5.4, 0.18, 1.86, 4, 0.08), materials.bodyDark, [0, 0.43, 0]));
car.add(mesh(new RoundedBoxGeometry(0.7, 0.08, 2.02, 3, 0.04), materials.bodyDark, [-2.65, 0.47, 0]));
car.add(mesh(new RoundedBoxGeometry(0.62, 0.08, 1.98, 3, 0.04), materials.bodyDark, [2.63, 0.5, 0]));

// Glass canopy and roof.
const canopyShape = new THREE.Shape();
canopyShape.moveTo(-1.48, 0);
canopyShape.bezierCurveTo(-1.1, 0.62, -0.65, 0.91, -0.16, 0.97);
canopyShape.bezierCurveTo(0.46, 1.02, 1.05, 0.7, 1.5, 0.05);
canopyShape.lineTo(1.28, -0.05);
canopyShape.lineTo(-1.35, -0.05);
canopyShape.closePath();
const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, {
  depth: 1.44,
  bevelEnabled: true,
  bevelSize: 0.06,
  bevelThickness: 0.05,
  bevelSegments: 4,
  curveSegments: 14,
});
canopyGeo.translate(0, 0, -0.72);
car.add(mesh(canopyGeo, materials.glass, [-0.1, 1.37, 0]));

const roofRail = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.35, 1.42, 0),
  new THREE.Vector3(-0.75, 2.13, 0),
  new THREE.Vector3(0.05, 2.32, 0),
  new THREE.Vector3(1.35, 1.45, 0),
]);
car.add(mesh(new THREE.TubeGeometry(roofRail, 32, 0.035, 8, false), materials.bodyDark));

// Glass separators and subtle body crease.
car.add(mesh(new RoundedBoxGeometry(0.045, 0.87, 1.51, 2, 0.018), materials.bodyDark, [0.42, 1.78, 0], [0, 0, -0.17]));
for (const z of [-0.935, 0.935]) {
  car.add(mesh(new RoundedBoxGeometry(4.25, 0.035, 0.025, 2, 0.01), materials.wheel, [-0.05, 1.14, z], [0, 0, 0.01]));
}

// Wheels, brakes, spokes, and wheel arch accents.
function createWheel(x, z) {
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(x, 0.48, z);

  wheelGroup.add(mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.34, 40, 1), materials.rubber, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheelGroup.add(mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.355, 32, 1), materials.wheel, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheelGroup.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.37, 28, 1), materials.brake, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheelGroup.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.39, 20, 1), materials.bodyDark, [0, 0, 0], [Math.PI / 2, 0, 0]));

  const faceZ = z > 0 ? 0.205 : -0.205;
  for (let i = 0; i < 10; i += 1) {
    const spoke = mesh(new RoundedBoxGeometry(0.38, 0.045, 0.035, 2, 0.012), materials.wheel, [0, 0, faceZ]);
    spoke.rotation.z = (i / 10) * Math.PI * 2;
    spoke.position.x = Math.cos(spoke.rotation.z) * 0.17;
    spoke.position.y = Math.sin(spoke.rotation.z) * 0.17;
    wheelGroup.add(spoke);
  }
  car.add(wheelGroup);
}

for (const x of [-1.92, 1.92]) {
  createWheel(x, -0.89);
  createWheel(x, 0.89);
}

// Lighting signatures.
for (const z of [-0.63, 0.63]) {
  car.add(mesh(new RoundedBoxGeometry(0.44, 0.07, 0.32, 4, 0.03), materials.light, [-2.73, 1.18, z], [0, 0, -0.08]));
  car.add(mesh(new RoundedBoxGeometry(0.22, 0.09, 0.43, 4, 0.035), materials.tailLight, [2.73, 1.2, z], [0, 0, 0.09]));
}

const tailStrip = mesh(new RoundedBoxGeometry(0.045, 0.045, 1.35, 3, 0.02), materials.tailLight, [2.82, 1.25, 0]);
car.add(tailStrip);

// Mirrors, rear wing, and interior hints.
for (const z of [-1.0, 1.0]) {
  car.add(mesh(new RoundedBoxGeometry(0.3, 0.1, 0.18, 4, 0.05), materials.body, [-0.85, 1.58, z]));
}
car.add(mesh(new RoundedBoxGeometry(0.72, 0.07, 1.68, 3, 0.025), materials.bodyDark, [2.28, 1.51, 0], [0, 0, 0.06]));
car.add(mesh(new RoundedBoxGeometry(0.07, 0.25, 0.07, 2, 0.02), materials.bodyDark, [2.2, 1.39, -0.66]));
car.add(mesh(new RoundedBoxGeometry(0.07, 0.25, 0.07, 2, 0.02), materials.bodyDark, [2.2, 1.39, 0.66]));
car.add(mesh(new RoundedBoxGeometry(0.5, 0.65, 0.48, 5, 0.12), materials.interior, [0.25, 1.52, -0.35], [0, 0, -0.12]));
car.add(mesh(new RoundedBoxGeometry(0.5, 0.65, 0.48, 5, 0.12), materials.interior, [0.25, 1.52, 0.35], [0, 0, -0.12]));

// Ground and contact shadow.
const ground = mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({
  color: 0x4a4942,
  opacity: 0.18,
}), [0, -0.1, 0], [-Math.PI / 2, 0, 0]);
ground.receiveShadow = true;
ground.castShadow = false;
scene.add(ground);

const shadow = mesh(
  new THREE.CircleGeometry(3.4, 64),
  new THREE.MeshBasicMaterial({ color: 0x79766d, transparent: true, opacity: 0.11, depthWrite: false }),
  [0, -0.07, 0],
  [-Math.PI / 2, 0, 0],
);
shadow.scale.set(1, 0.38, 1);
shadow.castShadow = false;
scene.add(shadow);

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

let introProgress = 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const startTime = performance.now();

function render(now) {
  requestAnimationFrame(render);
  if (!reducedMotion && introProgress < 1) {
    introProgress = Math.min((now - startTime) / 1500, 1);
    const eased = 1 - Math.pow(1 - introProgress, 3);
    car.rotation.y = -0.7 + eased * 0.52;
    car.position.y = -0.25 + eased * 0.25;
  }
  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(render);

window.setTimeout(() => {
  document.querySelector(".loading-screen").classList.add("hidden");
  document.querySelectorAll(".feature-label").forEach((label, index) => {
    window.setTimeout(() => label.classList.add("visible"), 250 + index * 140);
  });
}, 650);

const featureContent = {
  aero: {
    index: "01 / AERODYNAMICS",
    title: "Active aerodynamics",
    copy: "The rear wing and underbody vanes adjust continuously. At speed, the system creates stability through corners; while cruising, it settles flush to reduce energy use.",
    value: "0.21 CD · 120 KG DOWNFORCE",
    camera: [7.2, 3.2, 7.2],
  },
  power: {
    index: "02 / PERFORMANCE",
    title: "Dual-motor power",
    copy: "Two compact electric motors deliver torque independently to each axle. Predictive software shifts power hundreds of times each second for grip without drama.",
    value: "780 HP · 1,020 NM TORQUE",
    camera: [5.2, 2.2, 8.8],
  },
  light: {
    index: "03 / INTELLIGENCE",
    title: "Matrix vision",
    copy: "Thousands of individually controlled light elements create a precise beam around other road users, giving full-distance illumination without glare.",
    value: "600 M · ADAPTIVE BEAM",
    camera: [-7.4, 2.7, 7.4],
  },
};

const modal = document.querySelector(".feature-modal");
const backdrop = document.querySelector(".modal-backdrop");
let cameraAnimation;

function moveCamera(destination) {
  const from = camera.position.clone();
  const to = new THREE.Vector3(...destination);
  const began = performance.now();

  cancelAnimationFrame(cameraAnimation);
  function update(time) {
    const progress = Math.min((time - began) / 900, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    camera.position.lerpVectors(from, to, eased);
    if (progress < 1) cameraAnimation = requestAnimationFrame(update);
  }
  cameraAnimation = requestAnimationFrame(update);
}

function openFeature(key) {
  const feature = featureContent[key];
  modal.querySelector(".modal-index").textContent = feature.index;
  modal.querySelector(".modal-title").textContent = feature.title;
  modal.querySelector(".modal-copy").textContent = feature.copy;
  modal.querySelector(".modal-value").textContent = feature.value;
  modal.classList.add("open");
  backdrop.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  moveCamera(feature.camera);
}

function closeFeature() {
  modal.classList.remove("open");
  backdrop.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".feature-label").forEach((label) => {
  label.querySelector("button").addEventListener("click", () => openFeature(label.dataset.feature));
});
modal.querySelector(".modal-close").addEventListener("click", closeFeature);
backdrop.addEventListener("click", closeFeature);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFeature();
});

document.querySelectorAll(".detail-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    document.querySelectorAll(".detail-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
  });
});

// A quiet synthesized electric hum, created only after a user click.
let audioContext;
let masterGain;
const soundButton = document.querySelector(".sound-toggle");
soundButton.addEventListener("click", () => {
  if (!audioContext) {
    audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    masterGain = audioContext.createGain();
    const overtoneGain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 56;
    overtone.type = "triangle";
    overtone.frequency.value = 112;
    masterGain.gain.value = 0;
    overtoneGain.gain.value = 0.025;
    oscillator.connect(masterGain);
    overtone.connect(overtoneGain).connect(masterGain);
    masterGain.connect(audioContext.destination);
    oscillator.start();
    overtone.start();
  }

  const isOff = soundButton.textContent.includes("off");
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.linearRampToValueAtTime(isOff ? 0.055 : 0, audioContext.currentTime + 0.35);
  soundButton.lastChild.textContent = isOff ? " Sound on" : " Sound off";
});

