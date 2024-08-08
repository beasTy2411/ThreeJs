import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

let container;
let camera, scene, renderer, controls;
let composer, outlinePass;

let selectedObjects = [];

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const obj3d = new THREE.Object3D();
const group = new THREE.Group();

const params = {
  edgeStrength: 3.0,
  edgeGlow: 0.0,
  edgeThickness: 1.0,
  pulsePeriod: 0,
  rotate: false,
  usePatternTexture: false,
};

init();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  // todo - support pixelRatio in this demo
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 8);

  controls = new OrbitControls(camera, renderer.domElement);

  //

  scene.add(new THREE.AmbientLight(0xaaaaaa, 0.6));

  const light = new THREE.DirectionalLight(0xddffdd, 2);
  light.position.set(1, 1, 1);

  scene.add(light);

  // model

  scene.add(group);

  group.add(obj3d);

  //

  const geometry = new THREE.SphereGeometry(3, 48, 24);

  for (let i = 0; i < 20; i++) {
    const material = new THREE.MeshLambertMaterial();
    material.color.setHSL(Math.random(), 1.0, 0.3);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random() * 4 - 2;
    mesh.position.y = Math.random() * 4 - 2;
    mesh.position.z = Math.random() * 4 - 2;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.scale.multiplyScalar(Math.random() * 0.3 + 0.1);
    group.add(mesh);
  }

  const floorMaterial = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
  });

  const floorGeometry = new THREE.PlaneGeometry(12, 12);
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x -= Math.PI * 0.5;
  floorMesh.position.y -= 1.5;
  group.add(floorMesh);
  floorMesh.receiveShadow = true;

  const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
  const torusMaterial = new THREE.MeshPhongMaterial({ color: 0xffaaff });
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);
  torus.position.z = -4;
  group.add(torus);
  torus.receiveShadow = true;
  torus.castShadow = true;

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
}

function animate() {
  controls.update();

  composer.render();
}
