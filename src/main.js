import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// const width = window.innerWidth,
//   height = window.innerHeight;
// const camera = new THREE.OrthographicCamera(
//   width / -2,
//   width / 2,
//   height / 2,
//   height / -2,
//   1,
//   1000
// );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// camera.position.z = 5;
camera.position.z = 6;

// movement - please calibrate these values
var xSpeed = 0.5;
var ySpeed = 0.5;

// document.body.addEventListener("keydown", onDocumentKeyDown);

cube.newPosition = new THREE.Vector3(
  cube.position.x,
  cube.position.y,
  cube.position.z
);

cube.isMoveX = false;
cube.isMoveY = false;

const onKeyDown = (event) => {
  let keyCode = event.code;
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
  }

  // if (keyCode == 87) {
  //   cube.position.y += ySpeed;
  // } else if (keyCode == 83) {
  //   cube.position.y -= ySpeed;
  // } else if (keyCode == 65) {
  //   cube.position.x -= xSpeed;
  // } else if (keyCode == 68) {
  //   cube.position.x += xSpeed;
  // } else if (keyCode == 32) {
  //   cube.position.set(0, 0, 0);
  // }
};

document.addEventListener("keydown", onKeyDown);

cube.move = () => {
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
      } else if (cube.position.y > cube.newPosition.y) {
        cube.position.y -= step;
      }
    }
  }
  if (!cube.isMoveX) {
    // console.log(cube.rotation);
    let step = 0.005;
    if (Math.abs(cube.rotation.y) > step) {
      if (cube.rotation.y < 0) {
        cube.rotation.y += step;
      } else {
        cube.rotation.y -= step;
      }
    }
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  cube.move();
  renderer.render(scene, camera);
  // console.log(cube.rotation);
};

animate();
