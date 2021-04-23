import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.js";
// import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js";

import { getRandomInt } from "./utils.js";

let scene;
let camera;
let renderer;
let loader;
let player;
let controls;
let galaxy;
let gameObjects = [];

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

const onKeyDown = async (event) => {
  let keyCode = event.code;

  switch (keyCode) {
    case "KeyS":
      player.moveDirection.y = 1;
      break;
    case "KeyW":
      player.moveDirection.y = -1;
      break;
    case "KeyD":
      player.moveDirection.x = 1;
      break;
    case "KeyA":
      player.moveDirection.x = -1;
      break;
    case "ShiftRight":
      const powerball = await generatePowerball();
      player.powerballs.push(powerball);
      break;
  }
  // console.log("down", keyCode);
};

const onKeyUp = (event) => {
  let keyCode = event.code;
  switch (keyCode) {
    case "KeyS":
      player.moveDirection.y = 0;
      break;
    case "KeyW":
      player.moveDirection.y = 0;
      break;
    case "KeyD":
      player.moveDirection.x = 0;
      break;
    case "KeyA":
      player.moveDirection.x = 0;
      break;
  }
  // console.log("up", keyCode);
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

  player.moveDirection = { x: 0, y: 0 };
  player.move = () => {
    let moveStep = 0.2;
    let rotateStep = 0.01;

    if (player.moveDirection.x > 0) {
      player.position.x += moveStep;
      player.rotation.y += rotateStep;
    } else if (player.moveDirection.x < 0) {
      player.position.x -= moveStep;
      player.rotation.y -= rotateStep;
    } else {
      if (Math.abs(player.rotation.y - player.initialRotation.y) > rotateStep) {
        if (player.rotation.y < player.initialRotation.y) {
          player.rotation.y += rotateStep;
        } else {
          player.rotation.y -= rotateStep;
        }
      }
      if (player.rotation.y > 2 * Math.PI) {
        player.rotation.y -= 2 * Math.PI;
      } else if (player.rotation.y < -2 * Math.PI) {
        player.rotation.y += 2 * Math.PI;
      }
    }

    if (player.moveDirection.y > 0) {
      player.position.y += moveStep;
      player.rotation.x += rotateStep;
    } else if (player.moveDirection.y < 0) {
      player.position.y -= moveStep;
      player.rotation.x -= rotateStep;
    } else {
      if (Math.abs(player.rotation.x - player.initialRotation.x) > rotateStep) {
        if (player.rotation.x < player.initialRotation.x) {
          player.rotation.x += rotateStep;
        } else {
          player.rotation.x -= rotateStep;
        }
      }
      if (player.rotation.x > 2 * Math.PI) {
        player.rotation.x -= 2 * Math.PI;
      } else if (player.rotation.x < -2 * Math.PI) {
        player.rotation.x += 2 * Math.PI;
      }
    }
  };

  player.powerballs = [];

  scene.add(player);
  controls.target = player.position;
};

const galaxySetup = () => {
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

const generatePowerball = async () => {
  const powerball = await importModel("src/assets/powerball.glb");
  console.log(powerball);
  powerball.scale.set(0.5, 0.5, 0.5);
  powerball.position.set(
    player.position.x,
    player.position.y - 0.5,
    player.position.z - 1.5
  );
  powerball.move = () => {
    powerball.position.z -= 0.5;
  };

  scene.add(powerball);
  return powerball;
};

const powerballHandler = () => {
  console.log(player.powerballs);
  player.powerballs = player.powerballs.filter((ball) => {
    // check for collision

    // check for out of bound
    if (player.position.z - ball.position.z > 100) {
      scene.remove(ball);
      return false;
    }
    return true;
  });
  player.powerballs.forEach((ball) => {
    ball.move();
  });
};

const generateStar = async () => {
  const star = await importModel("src/assets/star2.glb");
  console.log(star);
  star.rotation.x = Math.PI / 2;

  star.move = () => {
    star.position.z += 0.5;
  };
  // star. = "star";

  scene.add(star);
  return star;
};

const gameObjectsSetup = async () => {
  for (let i = 0; i < getRandomInt(20, 25); i++) {
    const star = await generateStar();
    console.log(star);
    star.position.set(
      getRandomInt(-20, 20),
      getRandomInt(-10, 10),
      getRandomInt(-1000, -50)
    );
    gameObjects.push(star);
  }
};

const gameObjectsHandler = () => {
  // check for object collision and reposition

  // move object
  gameObjects.forEach((gameObject) => {
    if (player.position.z - gameObject.position.z < -10) {
      gameObject.position.set(
        getRandomInt(-20, 20),
        getRandomInt(-10, 10),
        getRandomInt(-1000, -50)
      );
    }
    gameObject.move();
  });
};

const initWorld = async () => {
  await playerSetup();
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  await gameObjectsSetup();
  galaxySetup();
};

const animate = async () => {
  requestAnimationFrame(animate);

  galaxy.update();
  player.move();
  powerballHandler();
  gameObjectsHandler();

  camera.position.x = player.position.x;
  camera.position.y = player.position.y;

  renderer.render(scene, camera);
  controls.update();
};

init();
await initWorld();
animate();
