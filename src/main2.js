import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";

import { getRandomInt } from "./utils.js";

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xff0000);
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const camera = new THREE.PerspectiveCamera(
//   45,
//   window.innerWidth / window.innerHeight,
//   1,
//   1000
// // );
// const width = window.innerWidth;
// const height = window.innerHeight;
// const camera = new THREE.OrthographicCamera(
//   width / -2,
//   width / 2,
//   height / 2,
//   height / -2,
//   1,
//   10
// );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// const skyColor = 0xb1e1ff; // light blue
// const groundColor = 0xb97a20; // brownish orange
// const intensity = 3;
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// scene.add(light);

// var light = new THREE.PointLight(0xffffcc, 20, 200);
// light.position.set(4, 30, -20);
// scene.add(light);

// var light2 = new THREE.AmbientLight(0x20202a, 20, 100);
// light2.position.set(30, -10, 30);
// scene.add(light2);

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// let cube = new THREE.Mesh(geometry, material);
// console.log(cube);
// scene.add(cube);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("src/libs/draco/gltf/");

var loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
// let cube;
// loader.load("src/assets/testcube.glb", function (gltf) {
//   // var scale = 5.6;
//   // bus.body = gltf.scene.children[0];
//   // console.log(gltf);
//   // // bus.body.name = “body”;
//   // bus.body.rotation.set(0, -1.5708, 0);
//   // bus.body.scale.set(scale, scale, scale);
//   // bus.body.position.set(0, 3.6, 0);
//   // bus.body.castShadow = true;
//   // bus.frame.add(bus.body);
//   // console.log(gltf.scene);
//   // cube = gltf.scene.children;
//   const obj = gltf.scene;
//   console.log(obj.position);
//   scene.add(gltf.scene.children);
// });

// loader.load(
//   "src/assets/testcube.glb",
//   function (gltf) {
//     const model = gltf.scene;
//     model.position.set(1, 1, 0);
//     model.scale.set(0.01, 0.01, 0.01);
//     model.traverse(function (child) {
//       if (child.isMesh) child.material.envMap = envMap;
//     });

//     scene.add(model);

//     mixer = new THREE.AnimationMixer(model);
//     mixer.clipAction(gltf.animations[0]).play();

//     animate();
//   },
//   undefined,
//   function (e) {
//     console.error(e);
//   }
// );

const [cubeData] = await Promise.all([
  // loader.loadAsync("src/assets/testcube.glb"),
  loader.loadAsync("src/assets/dorand2.glb"),
]);
console.log(cubeData);
// extracting mesh
let cube = cubeData.scene.children[2];
console.log(cube);
cube.scale.set(0.5, 0.5, 1);
console.log(cube.rotation);
cube.rotation.z = -Math.PI / 2;
cube.rotation.y = 0;
cube.initialRotation = new THREE.Vector3(
  cube.rotation.x,
  cube.rotation.y,
  cube.rotation.z
);

scene.add(cube);

// cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
// cameraControls.target.set(0, 50, 0);

camera.position.z = 10;

// movement - please calibrate these values
var xSpeed = 0.5;
var ySpeed = 0.5;

cube.newPosition = new THREE.Vector3(
  cube.position.x,
  cube.position.y,
  cube.position.z
);

cube.isMoveX = false;
cube.isMoveY = false;

const onKeyDown = (event) => {
  let keyCode = event.code;
  console.log(keyCode);
  switch (keyCode) {
    case "KeyW":
      if (!cube.isMoveY) {
        cube.newPosition.y += ySpeed;
        cube.isMoveY = true;
      }
      break;
    case "KeyS":
      if (!cube.isMoveY) {
        cube.newPosition.y -= ySpeed;
        cube.isMoveY = true;
      }
      break;
    case "KeyD":
      if (!cube.isMoveX) {
        cube.newPosition.x += xSpeed;
        cube.isMoveX = true;
      }
      break;
    case "KeyA":
      if (!cube.isMoveX) {
        cube.newPosition.x -= xSpeed;
        cube.isMoveX = true;
      }
      break;
    case "ShiftRight":
      generatePowerball(scene);
      break;
  }
};

document.addEventListener("keydown", onKeyDown);

cube.move = () => {
  if (!cube.isMoveX) {
    // console.log(cube.rotation);
    let step = 0.01;
    if (Math.abs(cube.rotation.y - cube.initialRotation.y) > step) {
      if (cube.rotation.y < cube.initialRotation.y) {
        cube.rotation.y += step;
      } else {
        cube.rotation.y -= step;
      }
    }
  }
  if (!cube.isMoveY) {
    let step = 0.01;

    if (Math.abs(cube.rotation.x - cube.initialRotation.x) > step) {
      if (cube.rotation.x < cube.initialRotation.x) {
        cube.rotation.x += step;
      } else {
        cube.rotation.x -= step;
      }
    }
  }
  if (cube.isMoveX || cube.isMoveY) {
    let step = 0.1;
    let flag = 0;
    if (Math.abs(cube.position.x - cube.newPosition.x) < step) {
      cube.isMoveX = false;
    } else {
      if (cube.position.x < cube.newPosition.x) {
        cube.position.x += step;
        cube.rotation.y += 0.01;
      } else if (cube.position.x > cube.newPosition.x) {
        cube.position.x -= step;
        cube.rotation.y -= 0.01;
      }
    }
    if (Math.abs(cube.position.y - cube.newPosition.y) < step) {
      cube.isMoveY = false;
      flag++;
    } else {
      if (cube.position.y < cube.newPosition.y) {
        cube.position.y += step;
        cube.rotation.x += 0.01;
      } else if (cube.position.y > cube.newPosition.y) {
        cube.position.y -= step;
        cube.rotation.x -= 0.01;
      }
    }
  }
};

const starMove = (star) => {
  let step = 0.5;
  star.position.z += step;
};

const ballMove = (ball) => {
  let step = 0.5;
  ball.position.z -= step;
};

const generateStar = async (scene) => {
  let [star] = await Promise.all([loader.loadAsync("src/assets/star2.glb")]);
  star = star.scene.children[2];

  star.position.set(getRandomInt(-4, 4), 4, -100);
  // star.scale.set(0.1, 0.1, 0.1);
  star.move = starMove;
  star.rotation.x = Math.PI / 2;
  scene.add(star);

  // console.log(star.scene.children[2]);
  return star;
};

let stars = [];

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
camera.position.set(cube.position.x, cube.position.y, camera.position.z);
// controls.target.set(cube.position.x, cube.position.y, cube.position.z);
controls.target = cube.position;

function detectCollision(object1, object2) {
  // console.log("Inside ");
  // console.log(object1.geometry);
  // console.log(object2.geometry);
  object1.geometry.computeBoundingBox(); //not needed if its already calculated
  object2.geometry.computeBoundingBox();
  object1.updateMatrixWorld();
  object2.updateMatrixWorld();

  var box1 = object1.geometry.boundingBox.clone();
  box1.applyMatrix4(object1.matrixWorld);

  var box2 = object2.geometry.boundingBox.clone();
  box2.applyMatrix4(object2.matrixWorld);

  return box1.intersectsBox(box2);
}

function detectCollisionGroupObject(group, object) {
  return group.children.some((component) => detectCollision(component, object));
}

const generatePowerball = async (scene) => {
  let [item] = await Promise.all([
    loader.loadAsync("src/assets/powerball.glb"),
  ]);
  // console.log(item.scene.children);
  // item = item.scene.children[3];

  // item.position.set(getRandomInt(-4, 4), 4, -10);
  // // item.position.set(cube.position.x, cube.position.y, cube.position.z - 5);
  // // star.scale.set(0.1, 0.1, 0.1);
  item.scene.move = ballMove;
  // // star.rotation.x = Math.PI / 2;
  // scene.add(item);
  // console.log(item);
  // // console.log(star.scene.children[2]);
  // item.scene.children.forEach((obj) => {
  //   obj.position.set(getRandomInt(-4, 4), 4, -10);
  //   obj.move = ballMove;
  //   scene.add(obj);
  // });
  item.scene.position.set(
    cube.position.x,
    cube.position.y,
    cube.position.z - 5
  );
  // item.scene.rotation.set(cube.rotation.x, cube.rotation.y, cube.rotation.z);
  console.log(item.scene);
  console.log(item.scene.geometry);
  scene.add(item.scene);
  powerballs = [...powerballs, item.scene];
  console.log(item);
  return item;
};

let powerballs = [];

// detectCollisionGroupObject(cube, cube);

const animate = async () => {
  requestAnimationFrame(animate);
  if (stars.length < 1) {
    let star = await generateStar(scene);
    stars = [...stars, star];
    // stars = [...stars, await generateStar(scene)];
  } else {
    stars = stars.filter((star) => {
      star.move(star);
      if (detectCollisionGroupObject(cube, star)) {
        scene.remove(star);
        return false;
      }
      if (cube.position.z - star.position.z < -5) {
        star.position.set(getRandomInt(-4, 4), 4, -100);
      }
      // console.log(cube.position.z - star.position.z );
      return true;
    });
  }
  powerballs.forEach((ball) => {
    ball.move(ball);
  });
  // console.log(stars);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  cube.move();
  // camera.position.set(cube.position.x, cube.position.y, camera.position.z);
  // camera.position.set(cube.position.x, cube.position.y, camera.position.z);
  camera.position.x = cube.position.x;
  camera.position.y = cube.position.y;
  // controls.target.x = cube.position.x;
  // controls.target.y = cube.position.y;
  // camera.rotation.set(cube.rotation);
  renderer.render(scene, camera);
  // if (stars.length > 0) console.log(detectCollisionCubes(cube, stars[0]));
  // console.log(cube.rotation);
  controls.update();
};

animate();
