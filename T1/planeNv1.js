import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import { stageSelector } from "./stages.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  SecondaryBox,
  createGroundPlaneXZ,
  getMaxSize,
} from "../libs/util/util.js";
import { shoot } from "./tiro.js";
import { Color } from "../build/three.module.js";
import { createTank, loadGLBFile, buildCanhao, buildPoste } from "./createTank.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
//import {buildPoste , buildCanhao} from "./PosteCanhaoCSG.js";

let scene,
  renderer,
  camera,
  AmbientColor = 0xf0f0f0,
  orbit,
  isOrbitEnabled = false,
  initialCameraPosition;

let AmbientLight = new THREE.AmbientLight (AmbientColor);
scene = new THREE.Scene();
scene.add(AmbientLight);
renderer = initRenderer();
camera = initCamera(new THREE.Vector3(0, -20, 30));
// light = initDefaultBasicLight(scene);
initialCameraPosition = camera.position.clone();
orbit = new OrbitControls(camera, renderer.domElement);
orbit.enabled = isOrbitEnabled;
let midpoint = new THREE.Vector3();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const rotationSpeed = 0.03;
const moveSpeed = 0.05;
const cooldown = 2;

const playerMaterial = new THREE.MeshPhongMaterial({ color: "green" });
const tank1Material = new THREE.MeshPhongMaterial({ color: "blue" });
const tank2Material = new THREE.MeshPhongMaterial({ color: "red" });
const level2WallsMaterial = new THREE.MeshLambertMaterial({color: "green"})
let cubes = [];
let projectiles = [];
var infoBox = new SecondaryBox("");

let assetPlayer = {
  object: null,
  loaded: false,
  colisoes: 3,
  bb: new THREE.Box3(),
};

let assettank1 = {
  object: null,
  loaded: false,
  colisoes: 3,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

let assettank2 = {
  object: null,
  loaded: false,
  colisoes: 3,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

createPlane(4);
//lightMap();
render();


function render() {
  infoBox.changeMessage("No collision detected");

  //checkProjectileCollisions(projectiles,cubeplayer1,cubeplayer2,cubes)
  //função pra fazer o jogo só funcionar depois dos tanques serem carregados
  //updateProjectiles(projectiles, 1);
  if (
    assetPlayer.object != null &&
    assettank1.object != null &&
    assettank2.object != null
  ) {
    assettank2.object.rotateX(0.01);
    updateAsset(assetPlayer);
    checkWallCollisions(cubes, projectiles);
    //checkProjectileCollisions();
  }
  keyboardUpdate(); //Movimenta os players
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function updateProjectiles(projectiles) {
  projectiles.forEach((projectile) => {
    console.log(projectile)
    projectile.position.add(projectile.velocity);
    projectile.bb.copy(projectile.position)
  });
}

function checkProjectileCollisions() {
  projectiles.forEach((projectile) => {
    if (assetPlayer.bb.intersectsBox(projectile.bb)) {
      assetPlayer.colisoes = assetPlayer.colisoes + 1;
      console.log(assetPlayer.colisoes)
    }

    if (assettank1.bb.intersectsBox(projectile.bb)) {
      assettank1.colisoes = assettank1-1;
      //console.log("sucesso3")
    }
    if (assettank2.bb.intersectsBox(projectile.bb)) {
      assettank2.colisoes = assettank2-1;
      //console.log(projectile)
      scene.remove(projectile);
    }
  });
}


//Funções de colisão

function updateAsset(asset) {
  asset.bb.setFromObject(asset.object);
  
  projectiles.forEach((projectile) => {
    //console.log(projectile.bb)
    //projectile.bb.setFromObject(projectile.object);
  });
}


function checkWallCollisions(cubes) {
  let collisionP1, collisionP2, collisionP3;
  (cubes || []).forEach((wall) => {
    collisionP1 = assetPlayer.bb.intersectsBox(wall.bb);
    collisionP2 = assettank1.bb.intersectsBox(wall.bb);
    collisionP3 = assettank2.bb.intersectsBox(wall.bb);
    //console.log(collisionP1 , collisionP2 , collisionP3," ")
    if (collisionP1) {
      //console.log(wall);
      infoBox.changeMessage("Collision detected Player");
    }
    if (collisionP2) {
      //console.log(wall);
      infoBox.changeMessage("Collision detected tank1");
    }
    
    if (collisionP3) {
      //console.log(wall.Box3);
      infoBox.changeMessage("Collision detected tank2");
    }
    
    projectiles.forEach((projectile,index) => {
      if (projectile.bb.intersectsBox(wall.bb)) {
        console.log(projectile.bb);
          
        /* dupla da deleção completa
          scene.remove(projectile);
          delete projectiles[index]
        */
          }
    });
  });
}

function getTankDirection(tank) {
  const direction = tank.getWorldDirection(new THREE.Vector3());
  const xDirection = direction.x;
  const yDirection = direction.y;
  
  direction.set(xDirection, yDirection, 0);
  return direction;
}

function keyboardUpdate() {
  var keyboard = new KeyboardState();
  
  //orbit.target = midpoint;
  //Funções para movimentar e atirar
  keyboard.update();
  //let vectorHelper = new THREE.Vector3
  //Movimenta tanque 1\
  if (keyboard.pressed("Q")) {
    //console.log(assetPlayer);
    /*projectiles.forEach((projectile) => {
      console.log (projectile)
      projectile.getWorldDirection(vectorHelper)
      console.log (vectorHelper)
    })*/
  }
  
  if (keyboard.pressed("A")) assetPlayer.object.rotateY(rotationSpeed);
  if (keyboard.pressed("D")) assetPlayer.object.rotateY(-rotationSpeed);
  if (keyboard.pressed("S")) assetPlayer.object.translateZ(-moveSpeed);
  if (keyboard.pressed("W")) assetPlayer.object.translateZ(moveSpeed);
  if (keyboard.pressed("left") && !keyboard.pressed("A"))
    assetPlayer.object.rotateY(rotationSpeed);
  if (keyboard.pressed("right") && !keyboard.pressed("D"))
    assetPlayer.object.rotateY(-rotationSpeed);
  if (keyboard.pressed("down") && !keyboard.pressed("S"))
    assetPlayer.object.translateZ(-moveSpeed);
  if (keyboard.pressed("up") && !keyboard.pressed("W"))
    assetPlayer.object.translateZ(moveSpeed);
  
  //Atira tanque 1
  if (keyboard.down("space"))
    projectiles.push(shoot(assetPlayer.object, 0.15, scene));
    //var box = new THREE.Box3();  
    //box.setFromObject(projectiles[projectiles.length-1])
    //projectilebbs.push()
  if (keyboard.down("1")) {
    scene.remove(scene);
    createPlane(1);
  }
  if (keyboard.down("2")) {
    scene.remove(scene);
    createPlane(4);
  }
  
  if (isOrbitEnabled) {
    //tentativa de fazer uma navegação com o teclado numpad
    // if (keyboard.pressed("8")) {camera.position.y= camera.position.y+1.1} ;
    // if (keyboard.pressed("2")) {camera.position.y= camera.position.y+1.1} ;
    // if (keyboard.pressed("4")) {camera.position.z= camera.position.z+1.1} ;
    // if (keyboard.pressed("6")) {camera.position.z= camera.position.z+1.1} ;
  }
  //Destrava camera (ao ser acionado novamente volta a camera para a posição anterior)
  if (keyboard.down("O")) {
    isOrbitEnabled = !isOrbitEnabled;
    orbit.enabled = isOrbitEnabled;
  }
  let DistanciaPlayers = calcularDistanciaPlayers(
    assetPlayer,
    assettank1.assettank2,
  );
  //Mantem a camera olhando sempre para o ponto medio
  if (!isOrbitEnabled) {
    //console.log( window.innerWidth);
    //precisa de alguma forma de relacionar o tamanho da janela e a distancia dos players para fazer todos sempre aparecerem
    
    camera.position.set(
      midpoint.x,
      midpoint.y - 10,
      10 + DistanciaPlayers + 15 / 3 + (0.5 / window.innerWidth),
    );
    camera.lookAt(midpoint);
  }
  
  //Aproximação e afasta a camera
}

function calcularDistanciaPlayers() {
  if (
    assetPlayer.object != null &&
    assettank1.object != null &&
    assettank2.object != null
  ) {
    // midpoint.add(cubeplayer1.position).add(cubeplayer2.position).divideScalar(3);
    midpoint
    .add(assetPlayer.object.position)
    .add(assettank1.object.position)
    .add(assettank2.object.position)
    .divideScalar(4);
    const d1 = calcDistancia(assetPlayer, assettank1);
    const d2 = calcDistancia(assetPlayer, assettank2);
    const d3 = calcDistancia(assettank1, assettank2);
    return Math.max(d1, d2, d3);
  }
  return 30.4;
}
function calcDistancia(asset1, asset2) {
  return asset1.object.position.distanceTo(asset2.object.position);
}
  
function createPlane(nivel) {
  //Cria o plano que ficarão os tanques
  const stageMatrix = stageSelector(nivel);

  //Cria um plano branco do tamanho da matriz
  const geometry = new THREE.PlaneGeometry(
    stageMatrix[0].length,
    stageMatrix.length,
  );
  const material = new THREE.MeshPhongMaterial({
    color: "darkgrey",
    side: THREE.DoubleSide,
  });
  const materialCube = new THREE.MeshBasicMaterial({
    color: "grey",
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  scene.add(plane);

  var cubeGeometry = new THREE.BoxGeometry(1, 1, 3);

  for (var i = 0; i < stageMatrix.length; i++) {
    for (var j = 0; j < stageMatrix[i].length; j++) {
      // Coloca todos os cubos no plano
      if (stageMatrix[i][j] === 1) {
        let cube = new THREE.Mesh(cubeGeometry, materialCube);
        cube.position.set(
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          0.49,
        );
        cubes.push({
          object: cube,
          bb: new THREE.Box3().setFromObject(cube),
        });
        scene.add(cube);
        //aux = aux+1
      }
      // Coloca o tanque 1 no plano
      if (stageMatrix[i][j] === 2) {
        loadGLBFile(
          scene,
          assetPlayer,
          "../assets/objects/toontanktrab2.glb",
          3.0,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          playerMaterial,
        );
      }
      // Coloca o tanque 2 no plano
      if (stageMatrix[i][j] === 3) {
        loadGLBFile(
          scene,
          assettank1,
          "../assets/objects/toontanktrab2.glb",
          3.0,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
        //cubeplayer2 = createTank('blue');
        //assetPlayer2.object = cubeplayer2;
        //scene.add(cubeplayer2);
      }
      if (stageMatrix[i][j] === 4) {
        loadGLBFile(
          scene,
          assettank2,
          "../assets/objects/toontanktrab2.glb",
          3.0,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank2Material,
        );
      }
      if (stageMatrix[i][j] === 5) {
        let cube = buildCanhao();
        cube.position.set(
          j + 1 - stageMatrix[i].length / 2,
          -i -2 + stageMatrix.length / 2,
          0,
        );
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 6) {
        let cube = buildPoste();
        cube.position.set(
          j + 0.25 - stageMatrix[i].length / 2,
          -i - 0.25 + stageMatrix.length / 2,
          0,
        );
        cube.rotateZ(THREE.MathUtils.degToRad(-125))
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 7) {
        let cube = buildPoste();
        cube.position.set(
          j + 0.75 - stageMatrix[i].length / 2,
          -i - 0.75 + stageMatrix.length / 2,
          0,
        );
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);
      }
      if (stageMatrix[i][j] === 8) {
        let cube = buildPoste();
        cube.position.set(
          j + 0.75 - stageMatrix[i].length / 2,
          -i - 0.75 + stageMatrix.length / 2,
          0,
        );
        cube.rotateZ(THREE.MathUtils.degToRad(45))
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);
      }
      if (stageMatrix[i][j] === 9) {
        let cube = buildPoste();
        cube.position.set(
          j + 0.75 - stageMatrix[i].length / 2,
          -i - 0.25 + stageMatrix.length / 2,
          0,
        );
        cube.rotateZ(THREE.MathUtils.degToRad(180))
        cube.scale.set(1.4,1.4,1.4)
        //console.log(cube)
        //cube.spotlight.target(THREE.Vector3(0,0,0))
        scene.add(cube);
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 10) {
        let cube = new THREE.Mesh(cubeGeometry, level2WallsMaterial);
        cube.position.set(
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          0.49,
        );
        cubes.push({
          object: cube,
          bb: new THREE.Box3().setFromObject(cube),
        });
        scene.add(cube);
        //aux = aux+1
      }
    }
  }
}