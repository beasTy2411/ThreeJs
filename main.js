import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

let camera, scene, renderer, controls;
let composer, outlinePass;
const container = document.getElementById("container");

let selectedObjects = [];

//init raycaster
const raycaster = new THREE.Raycaster();

//init pointer
const mouse = new THREE.Vector2();

//init scene
scene = new THREE.Scene();

//init camera
camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 8);

//inti renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

//init orbit controls
controls = new OrbitControls(camera, renderer.domElement);
controls.update();

//init lights
scene.add(new THREE.AmbientLight(0xdddddd, 1));
const light = new THREE.DirectionalLight(0xddffdd, 2);
light.position.set(10, 7, 8);
scene.add(light);

//inti mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  specular: 0x111111,
  shininess: 5,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// postprocessing

composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

renderer.domElement.addEventListener("pointermove", onPointerMove);

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function addSelectedObject(object) {
  selectedObjects = [];
  selectedObjects.push(object);
}

function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(scene, true);

  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    addSelectedObject(selectedObject);
    outlinePass.selectedObjects = selectedObjects;
  } else {
    outlinePass.selectedObjects = [];
  }
}

function animate() {
  controls.update();

  composer.render();
}
