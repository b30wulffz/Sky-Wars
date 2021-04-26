import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.js";
// import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js";

import { getRandomInt, getRandomArbitrary } from "./utils.js";

let scene;
let camera;
let renderer;
let loader;
let headLight;
let player;
let controls;
let galaxy;
let gameObjects = [];
let gameStart = false;
let enemyPowerballs = [];
let animationFrameId;

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
  const intensity = 1.5;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);

  headLight = new THREE.PointLight(0xffffff, 1, 100);
  headLight.position.set(0, 0, -1);
  scene.add(headLight);

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
    case "Space":
      if (player.powerballs.length < 3) {
        const powerball = await generatePowerball();
        player.powerballs.push(powerball);
      }
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
      // adding movement limits
      if (player.position.x < 20) {
        player.position.x += moveStep;
        // if (player.rotation.y < Math.PI / 6) {
        player.rotation.y += rotateStep;
        // }
      }
    } else if (player.moveDirection.x < 0) {
      // adding movement limits
      if (player.position.x > -20) {
        player.position.x -= moveStep;
        // if (player.rotation.y > -Math.PI / 6) {
        player.rotation.y -= rotateStep;
        // }
      }
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
      // adding movement limits
      if (player.position.y < 10) {
        player.position.y += moveStep;
        if (player.rotation.x < Math.PI / 4) {
          player.rotation.x += rotateStep;
        }
      }
    } else if (player.moveDirection.y < 0) {
      // adding movement limits
      if (player.position.y > -10) {
        player.position.y -= moveStep;
        if (player.rotation.x > -Math.PI) {
          player.rotation.x -= rotateStep;
        }
      }
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
  player.info = {
    health: 100,
    score: 0,
    stars: 0,
    asteroid: 0,
    enemy: 0,
  };
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
  // console.log(powerball);
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
  // console.log(player.powerballs);
  player.powerballs = player.powerballs.filter((ball) => {
    // check for collision
    for (let i = 0; i < gameObjects.length; i++) {
      const gameObject = gameObjects[i];
      if (gameObject.objectType == "asteroid") {
        if (detectCollisionGroup(ball, gameObject, false)) {
          gameObject.destroy = true;
          scene.remove(ball);
          if (gameStart) {
            player.info.score += 10;
            player.info.asteroid += 1;
          }
          return false;
        }
      } else if (gameObject.objectType == "enemy") {
        if (detectCollisionGroup(ball, gameObject, false)) {
          gameObject.destroy = true;
          scene.remove(ball);
          if (gameStart) {
            player.info.score += 15;
            player.info.enemy += 1;
          }
          return false;
        }
      }
    }
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

const generateEnemyPowerball = async (enemyPosition) => {
  const powerball = await importModel("src/assets/enemyPowerball.glb");
  // console.log(powerball);
  powerball.scale.set(0.5, 0.5, 0.5);
  powerball.position.set(
    enemyPosition.x,
    enemyPosition.y - 0.5,
    enemyPosition.z - 1.5
  );
  powerball.move = () => {
    powerball.position.z += 1.5;
  };

  scene.add(powerball);
  return powerball;
};

const enemyPowerballHandler = () => {
  // console.log(player.powerballs);
  enemyPowerballs = enemyPowerballs.filter((ball) => {
    // check for collision with player
    if (detectCollisionGroup(player, ball, true)) {
      scene.remove(ball);
      if (gameStart) {
        player.info.health -= getRandomInt(40, 60);
        shakePlayer();
      }
      return false;
    }
    // check for out of bound
    if (player.position.z - ball.position.z < -10) {
      scene.remove(ball);
      return false;
    }
    return true;
  });
  enemyPowerballs.forEach((ball) => {
    ball.move();
  });
};

const generateStar = async () => {
  const star = await importModel("src/assets/star2.glb");
  star.rotation.x = Math.PI / 2;

  star.move = () => {
    star.position.z += 0.5;
  };
  star.objectType = "star";

  scene.add(star);
  return star;
};

const generateAsteroid = async () => {
  const asteroid = await importModel("src/assets/asteroid.glb");
  asteroid.rotation.x = Math.PI / 2;

  asteroid.destroy = false;

  asteroid.destroyMovement = {
    x:
      getRandomArbitrary(0, 1) < 0.5
        ? -getRandomArbitrary(0.2, 0.3)
        : getRandomArbitrary(0.2, 0.3),
    y:
      getRandomArbitrary(0, 1) < 0.5
        ? -getRandomArbitrary(0.2, 0.3)
        : getRandomArbitrary(0.2, 0.3),
  };
  asteroid.move = () => {
    asteroid.rotation.x += 0.1;
    asteroid.rotation.y += 0.1;
    if (!asteroid.destroy) {
      asteroid.position.z += 0.5;
    } else {
      asteroid.position.z += 0.1;
      asteroid.position.x += asteroid.destroyMovement.x;
      asteroid.position.y += asteroid.destroyMovement.y;
      if (
        asteroid.position.x > 40 ||
        asteroid.position.x < -40 ||
        asteroid.position.y > 40 ||
        asteroid.position.y < -40
      ) {
        asteroid.position.set(
          getRandomInt(-20, 20),
          getRandomInt(-10, 10),
          getRandomInt(-1000, -50)
        );
        asteroid.destroy = false;
      }
    }
  };
  asteroid.objectType = "asteroid";

  scene.add(asteroid);
  return asteroid;
};

const generateEnemy = async () => {
  let enemy = await importModel("src/assets/dorand2.glb");
  enemy = enemy.children[2];
  enemy.scale.set(0.5, 0.5, 1);
  enemy.rotation.set(enemy.rotation.x, 0, Math.PI / 2);
  enemy.initialRotationX = enemy.rotation.x;

  enemy.destroy = false;

  enemy.destroyMovement = {
    x:
      getRandomArbitrary(0, 1) < 0.5
        ? -getRandomArbitrary(0.2, 0.4)
        : getRandomArbitrary(0.2, 0.4),
    y: -getRandomArbitrary(0.2, 0.3),
    // getRandomArbitrary(0, 1) < 0.5
    //   ? -getRandomArbitrary(0.2, 0.3)
    //   : getRandomArbitrary(0.2, 0.3),
    rotationX: getRandomArbitrary(0, 1) < 0.5 ? 0.03 : -0.03,
    rotationY: getRandomArbitrary(0, 1) < 0.5 ? 0.1 : -0.1,
  };

  enemy.moveDirection = { x: 0.2, y: 0.2 };
  enemy.move = async () => {
    if (!enemy.destroy) {
      //zig zag movement
      if (enemy.position.x > 20) {
        enemy.moveDirection.x = -enemy.moveDirection.x;
      } else if (enemy.position.x < -20) {
        enemy.moveDirection.x = -enemy.moveDirection.x;
      }

      if (enemy.position.y > 10) {
        enemy.moveDirection.y = -enemy.moveDirection.y;
      } else if (enemy.position.y < -10) {
        enemy.moveDirection.y = -enemy.moveDirection.y;
      }

      enemy.position.x += enemy.moveDirection.x;
      enemy.position.y += enemy.moveDirection.y;
      enemy.position.z += 1;
      // enemy spawns bullets
      let dist = player.position.z - enemy.position.z;
      if (dist > 30 && dist < 140) {
        if (getRandomArbitrary(0, 1) < 0.04) {
          if (enemyPowerballs.length < 3) {
            const powerball = await generateEnemyPowerball(enemy.position);
            enemyPowerballs.push(powerball);
          }
        }
      }
    } else {
      // when bullet hits enemy
      enemy.position.z += 0.1;
      enemy.position.x += enemy.destroyMovement.x;
      enemy.position.y += enemy.destroyMovement.y;
      enemy.rotation.x += enemy.destroyMovement.rotationX;
      enemy.rotation.y += enemy.destroyMovement.rotationY;
      if (
        enemy.position.x > 40 ||
        enemy.position.x < -40 ||
        enemy.position.y > 40 ||
        enemy.position.y < -40
      ) {
        enemy.position.set(
          getRandomInt(-20, 20),
          getRandomInt(-10, 10),
          getRandomInt(-1000, -50)
        );
        enemy.rotation.set(enemy.initialRotationX, 0, Math.PI / 2);
        enemy.destroy = false;
      }
    }
  };
  enemy.objectType = "enemy";

  scene.add(enemy);
  return enemy;
};

const gameObjectsSetup = async () => {
  // adding stars
  for (let i = 0; i < getRandomInt(20, 25); i++) {
    const star = await generateStar();
    star.position.set(
      getRandomInt(-20, 20),
      getRandomInt(-10, 10),
      getRandomInt(-1000, -50)
    );
    gameObjects.push(star);
  }

  // adding asteroids
  for (let i = 0; i < getRandomInt(20, 25); i++) {
    const asteroid = await generateAsteroid();
    asteroid.position.set(
      getRandomInt(-20, 20),
      getRandomInt(-10, 10),
      getRandomInt(-1000, -50)
    );
    gameObjects.push(asteroid);
  }

  // adding enemy
  for (let i = 0; i < getRandomInt(3, 4); i++) {
    const enemy = await generateEnemy();
    enemy.position.set(
      getRandomInt(-20, 20),
      getRandomInt(-10, 10),
      getRandomInt(-1000, -200)
    );
    gameObjects.push(enemy);
  }
};

const detectCollision = (object1, object2) => {
  object1.geometry.computeBoundingBox();
  object2.geometry.computeBoundingBox();
  object1.updateMatrixWorld();
  object2.updateMatrixWorld();

  var box1 = object1.geometry.boundingBox.clone();
  box1.applyMatrix4(object1.matrixWorld);

  var box2 = object2.geometry.boundingBox.clone();
  box2.applyMatrix4(object2.matrixWorld);

  return box1.intersectsBox(box2);
};

function detectCollisionGroup(group1, group2, isPlane) {
  const meshChildren1 = group1.children.filter((obj) => obj.type === "Mesh");
  const meshChildren2 = group2.children.filter((obj) => obj.type === "Mesh");
  for (let i = 0; i < meshChildren1.length; i++) {
    for (let j = 0; j < meshChildren2.length; j++) {
      if (detectCollision(meshChildren1[i], meshChildren2[j])) {
        return true;
      }
    }
    if (isPlane) {
      return false;
    }
  }
  return false;
}

const shakePlayer = () => {
  player.rotation.x += getRandomArbitrary(0, 1) < 0.5 ? 0.05 : -0.05;
  player.rotation.y += getRandomArbitrary(0, 1) < 0.5 ? 0.05 : -0.05;
};

const gameObjectsHandler = () => {
  // check for object collision and reposition
  // move object
  gameObjects.forEach(async (gameObject) => {
    if (detectCollisionGroup(player, gameObject, true)) {
      gameObject.position.set(
        getRandomInt(-20, 20),
        getRandomInt(-10, 10),
        getRandomInt(-1000, -50)
      );
      if (gameStart) {
        switch (gameObject.objectType) {
          case "asteroid":
            player.info.health -= getRandomInt(10, 30);
            shakePlayer();
            break;
          case "enemy":
            player.info.health -= 110;
            shakePlayer();
            break;
          case "star":
            player.info.score += 20;
            player.info.stars += 1;
            break;
        }
      }
    } else if (player.position.z - gameObject.position.z < -10) {
      gameObject.position.set(
        getRandomInt(-20, 20),
        getRandomInt(-10, 10),
        getRandomInt(-1000, -50)
      );
    }
    await gameObject.move();
  });
};

// const addText = () => {
//   // let sprite = new THREE.TextSprite({
//   //   text: "Hello World!",
//   //   fontFamily: "Arial, Helvetica, sans-serif",
//   //   fontSize: 12,
//   //   color: "#ffbbff",
//   // });
//   // scene.add(sprite);
//   // var spriteText = new THREE.SpriteText({ text: "Hello world!" });
//   // scene.add(spriteText);
//   var text2 = document.createElement("div");
//   text2.className = "aClassName";
//   text2.style.position = "absolute";
//   //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
//   text2.style.width = 100;
//   text2.style.height = 100;
//   text2.style.backgroundColor = "rgba(207, 214, 218, 0.2)";
//   // text2.style = {
//   //   position: "absolute",
//   //   width: 100,
//   //   height: 100,
//   //   backgroundColor: "blue",
//   // };
//   text2.innerHTML = "hi there!";
//   text2.style.top = 200 + "px";
//   text2.style.left = 200 + "px";
//   document.body.appendChild(text2);
// };

const initWorld = async () => {
  await playerSetup();
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  await gameObjectsSetup();
  galaxySetup();
  setTimeout(() => {
    gameStart = true;
  }, 1000);
};

const hudHandler = () => {
  document.getElementById("score").innerHTML = Math.round(player.info.score);
  let health = Math.round(player.info.health);
  if (health < 0) {
    health = 0;
  }
  document.getElementById("health-bar").value = health;
  document.getElementById("stars").innerHTML = Math.round(player.info.stars);
  for (let i = 1; i <= 3; i++) {
    const divId = `powerball-${i}`;
    if (i <= 3 - player.powerballs.length) {
      document.getElementById(divId).style.backgroundColor =
        "rgb(22, 244, 208)";
    } else {
      document.getElementById(divId).style.backgroundColor =
        "rgb(74, 128, 119)";
    }
  }
};

const gameOverHandler = () => {
  document.getElementById("final-score").innerHTML = Math.round(
    player.info.score
  );
  document.getElementById("final-stars").innerHTML = player.info.stars;
  document.getElementById("final-asteroids").innerHTML = player.info.asteroid;
  document.getElementById("final-enemies").innerHTML = player.info.enemy;
  document.getElementById("game-over").style.display = "flex";
  setTimeout(() => {
    document.getElementById("game-over").style.opacity = 1;
  }, 100);
};

const animate = async () => {
  animationFrameId = requestAnimationFrame(animate);

  if (player.info.health > 0) {
    galaxy.update();
    player.move();
    powerballHandler();
    enemyPowerballHandler();
    gameObjectsHandler();
    hudHandler();

    camera.position.x = player.position.x;
    camera.position.y = player.position.y;

    headLight.position.x = player.position.x;
    headLight.position.y = player.position.y;
    headLight.position.z = player.position.z;
    if (gameStart) {
      player.info.score += 0.1;
    }
    // console.log(player.info);
  } else {
    // when collision thus fall
    if (player.position.y > -120) {
      player.position.y -= 0.5;
      player.rotation.y += 0.1;
      setTimeout(() => gameOverHandler(), 1500);
    } else {
      scene.remove(player);
    }
  }

  renderer.render(scene, camera);
  controls.update();
};

const start = async () => {
  init();
  await initWorld();
  animate();
};

start();
