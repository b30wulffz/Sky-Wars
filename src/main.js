// import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.js";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js";

import { getRandomInt } from "./utils.js";

let scene;
let camera;
let renderer;
let loader;
let player;
let controls;
let galaxy;
let galaxyGeometry;

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("src/libs/draco/gltf/");

  loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  //   const axesHelper = new THREE.AxesHelper(5);
  //   scene.add(axesHelper);
};

const importModel = async (path) => {
  const [item] = await Promise.all([loader.loadAsync(path)]);
  return item.scene;
};

const onKeyDown = (event) => {
  let xSpeed = 0.5;
  let ySpeed = 0.5;
  let keyCode = event.code;

  switch (keyCode) {
    case "KeyW":
      if (!player.isMoveY) {
        player.newPosition.y += ySpeed;
        player.isMoveY = true;
      }
      break;
    case "KeyS":
      if (!player.isMoveY) {
        player.newPosition.y -= ySpeed;
        player.isMoveY = true;
      }
      break;
    case "KeyD":
      if (!player.isMoveX) {
        player.newPosition.x += xSpeed;
        player.isMoveX = true;
      }
      break;
    case "KeyA":
      if (!player.isMoveX) {
        player.newPosition.x -= xSpeed;
        player.isMoveX = true;
      }
      break;
    case "ShiftRight":
      generatePowerball(scene);
      break;
  }
};

const playerSetup = async () => {
  player = await importModel("src/assets/dorand2.glb");
  player = player.children[2];
  player.scale.set(0.5, 0.5, 1);
  //   player.position.set(3.7, -1, 0);
  //   player.rotation.set(0, -Math.PI / 2, 0);
  player.rotation.set(player.rotation.x, 0, -Math.PI / 2);
  player.initialRotation = new THREE.Vector3(
    player.rotation.x,
    player.rotation.y,
    player.rotation.z
  );

  player.newPosition = new THREE.Vector3(
    player.position.x,
    player.position.y,
    player.position.z
  );

  player.isMoveX = false;
  player.isMoveY = false;

  player.move = () => {
    if (!player.isMoveX) {
      let step = 0.02;
      if (Math.abs(player.rotation.y - player.initialRotation.y) > step) {
        if (player.rotation.y < player.initialRotation.y) {
          player.rotation.y += step;
        } else {
          player.rotation.y -= step;
        }
      }
    }

    if (!player.isMoveY) {
      let step = 0.02;
      if (Math.abs(player.rotation.x - player.initialRotation.x) > step) {
        if (player.rotation.x < player.initialRotation.x) {
          player.rotation.x += step;
        } else {
          player.rotation.x -= step;
        }
      }
    }

    if (player.isMoveX || player.isMoveY) {
      let step = 0.1;
      if (Math.abs(player.position.x - player.newPosition.x) < step) {
        player.isMoveX = false;
      } else {
        if (player.position.x < player.newPosition.x) {
          player.position.x += step;
          player.rotation.y += 0.02;
        } else if (player.position.x > player.newPosition.x) {
          player.position.x -= step;
          player.rotation.y -= 0.02;
        }
      }
      if (Math.abs(player.position.y - player.newPosition.y) < step) {
        player.isMoveY = false;
      } else {
        if (player.position.y < player.newPosition.y) {
          player.position.y += step;
          player.rotation.x += 0.02;
        } else if (player.position.y > player.newPosition.y) {
          player.position.y -= step;
          player.rotation.x -= 0.02;
        }
      }
    }
  };

  scene.add(player);
  controls.target = player.position;
};

const galaxySetup = () => {
  //   let galaxyGeometry = new THREE.VertexGeometry();

  let vertices = [];
  for (let num = 0; num < 1000; num++) {
    const pointLight = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    pointLight.acceleration = 0.02;
    pointLight.speed = 0;
    vertices.push(pointLight);
  }

  const galaxyGeometry = new THREE.BufferGeometry().setFromPoints(vertices);

  const galaxyMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.7,
    map: new THREE.TextureLoader().load("src/assets/point.png"),
  });

  galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  galaxy.vertices = vertices;

  scene.add(galaxy);

  galaxy.update = () => {
    const positions = galaxy.geometry.attributes.position.array;
    const offset = 2;
    let vertexInd = 0;

    for (let i = offset; i < positions.length; i += 3) {
      galaxy.vertices[vertexInd].speed +=
        galaxy.vertices[vertexInd].acceleration;
      positions[i] += galaxy.vertices[vertexInd].speed;

      if (positions[i] > 200) {
        positions[i] = -200;
        galaxy.vertices[vertexInd].speed = 0;
      }

      galaxy.vertices[vertexInd].z = positions[i];
      vertexInd++;
    }
    galaxy.geometry.attributes.position.needsUpdate = true;
    galaxy.rotation.z += 0.003;
  };
};

const initWorld = async () => {
  await playerSetup();
  document.addEventListener("keydown", onKeyDown);
  galaxySetup();
};

const animate = async () => {
  requestAnimationFrame(animate);

  galaxy.update();
  player.move();

  camera.position.x = player.position.x;
  camera.position.y = player.position.y;

  renderer.render(scene, camera);
  controls.update();
};

init();
await initWorld();
animate();
