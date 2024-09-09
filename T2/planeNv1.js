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
import { Color, DirectionalLight, Vector3 } from "../build/three.module.js";
import { createTank, loadGLBFile, buildCanhao, buildPoste } from "./createTank.js";
import { checkColisionSideTank, colisao } from "./colision.js";
//import {buildPoste , buildCanhao} from "./PosteCanhaoCSG.js";
let UltimoTiro = Date.now();

let scene,
  renderer,
  camera,
  AmbientColor = 0xa0a0a0,
  orbit,
  isOrbitEnabled = false,
  initialCameraPosition;

let position =  new THREE.Vector3(1.0, 0.5, 0.6);
let lightColor = "rgb(255, 255, 255)";
let dirLight = new DirectionalLight(lightColor, 0.2);
  dirLight.position.copy(position);
let AmbientLight = new THREE.AmbientLight (AmbientColor, 0.3);
scene = new THREE.Scene();
renderer = initRenderer();
camera = initCamera(new THREE.Vector3(0, -20, 30));
initialCameraPosition = camera.position.clone();
orbit = new OrbitControls(camera, renderer.domElement);
orbit.enabled = isOrbitEnabled;
let midpoint = new THREE.Vector3();
const targetPoste1 = new THREE.Object3D()
targetPoste1.position.set(-12,5,-10)

const targetPoste2 = new THREE.Object3D()
targetPoste2.position.set(12,-5,-10)
const targetPoste3 = new THREE.Object3D()
targetPoste3.position.set(1,6,-10)

const targetPoste4 = new THREE.Object3D()
targetPoste4.position.set(1,-6,-10)


window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const rotationSpeed = 0.03;
const moveSpeed = 0.05;
const cooldown = 3;
let mapa_atual ;
const playerMaterial = new THREE.MeshPhongMaterial({ color: "green" });
const tank1Material = new THREE.MeshPhongMaterial({ color: "blue" });
const tank2Material = new THREE.MeshPhongMaterial({ color: "red" });
const level2WallsMaterial = new THREE.MeshLambertMaterial({color: "green"})
let cubes = [];
let projectiles = [];
var infoBox = new SecondaryBox("");
var auxCanhaoCentral;

let assetPlayer = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(),
};

let assettank1 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

let assettank2 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

mapa_atual =  createPlane(2);
render();

function tanksController(){
  if( Date.now() - UltimoTiro > 3000)
  {
    

    if (assettank1.colisoes > 0)
    projectiles.push(shoot(assettank1.object, 0.15, scene));
    if (assettank2.colisoes > 0)
    projectiles.push(shoot(assettank2.object, 0.15, scene));
    UltimoTiro = Date.now();
  }
}

function render() {
  infoBox.changeMessage("No collision detected");

  //função pra fazer o jogo só funcionar depois dos tanques serem carregados
  updateProjectiles(projectiles, 1);
  if (
    assetPlayer.object != null &&
    assettank1.object != null &&
    assettank2.object != null
  ) {
    //assettank1.object.rotateX(0.01);
    updateAsset(assetPlayer);
    checkWallCollisions(cubes, projectiles);
    checkProjectileCollisions();
    tanksController();
  }
  keyboardUpdate(); //Movimenta os players
  requestAnimationFrame(render);
  checkRestart()
  renderer.render(scene, camera);
}
function updateProjectiles(projectiles) {
  projectiles.forEach((projectile) => {
    projectile.position.add(projectile.velocity.clone());
    projectile.bb.copy(projectile.position)
  });
}

function checkRestart(){
  //console.log (assettank1)
  if(assetPlayer.colisoes == 0){
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    mapa_atual = createPlane(mapa_atual);
    
  }
  if (assettank1.colisoes < 1){
    if (assettank2.colisoes < 1){
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      mapa_atual = createPlane(mapa_atual);
    }
  }
}
function checkProjectileCollisions() {
  projectiles.forEach((projectile,index) => {
    if (projectile.bb.intersectsBox(assetPlayer.bb)) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
      delete projectile[index];

      
      scene.remove(projectile.bb);
      scene.remove(projectile);
      assetPlayer.colisoes -= 1;
      //console.log("sucesso")
    }
    
    if (assettank1.bb.intersectsBox(projectile.bb)) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
      scene.remove(projectile.bb);
      scene.remove(projectile);

      assettank1.colisoes -= 1;

      if(assettank1.colisoes == 0)
        {
          scene.remove(assettank1.bb);
          scene.remove(assettank1.object)
        }
      projectile.remove;
    }

    if (assettank2.bb.intersectsBox(projectile.bb)) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
      scene.remove(projectile.bb);
      scene.remove(projectile);

      assettank2.colisoes -= 1;

      if(assettank2.colisoes == 0)
        {
          scene.remove(assettank2.bb);
          scene.remove(assettank2.object)
        }
      projectile.remove;
    }

    /*if (projectile.bb.intersectsBox(assettank2.bb)) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
      delete projectile[index]
      scene.remove(projectile.bb);
      scene.remove(projectile);
      assettank2.colisoes = -1;

      if(assettank2.colisoes == 0)
      {
          scene.remove(assettank2.bb);
          scene.remove(assettank2.object)
      }
      console.log("sucesso")
      projectile.remove;
    }
    */
  });
}


//Funções de colisão

function updateAsset() {
  if (assetPlayer.colisoes > 0){
  assetPlayer.bb.copy(assetPlayer.object.position);
  assetPlayer.bb.setFromObject(assetPlayer.object);
  if (assetPlayer.object.children.length == 1)
    lifeBar(assetPlayer.colisoes,assetPlayer.object)
    
    if (assetPlayer.colisoes != assetPlayer.object.children[1].geometry.parameters.width)
      assetPlayer.object.remove(assetPlayer.object.children [1])
        lifeBar(assetPlayer.colisoes,assetPlayer.object)
  }
  else
  {
    assetPlayer.bb = new THREE.Box3(new THREE.Vector3(300,300,300))
  }

  if (assettank1.colisoes > 0){
  assettank1.bb.copy(assettank1.object.position);
  assettank1.bb.setFromObject(assettank1.object);
  if (assettank1.object.children.length == 1)
    lifeBar(assettank1.colisoes,assettank1.object)
  if (assettank1.colisoes != assettank1.object.children[1].geometry.parameters.width)
  {
    assettank1.object.remove(assettank1.object.children [1])
    lifeBar(assettank1.colisoes,assettank1.object)
  }
  }
  else
  {
    assettank1.bb = new THREE.Box3(new THREE.Vector3(300,300,300))
  }

  if (assettank2.colisoes > 0){
  assettank2.bb.copy(assettank2.object.position);
  assettank2.bb.setFromObject(assettank2.object);

  if (assettank2.object.children.length == 1)
    lifeBar(assettank2.colisoes,assettank2.object)
    if (assettank2.colisoes != assettank2.object.children[1].geometry.parameters.width)
    {
      assettank2.object.remove(assettank2.object.children [1])
      lifeBar(assettank2.colisoes,assettank2.object)
    }  
  }
  else
  {
    assettank2.bb = new THREE.Box3(new THREE.Vector3(300,300,300))
  }

  projectiles.forEach((projectile) => {
    projectile.bb.setFromObject(projectile)
    //console.log(projectile.bb);
  });

  movCanhaoCentral();
}

function lifeBar(vida,objeto)
{
  let materialLife = new THREE.MeshPhongMaterial({ color: "red" });
  let cubegeometryLife = new THREE.BoxGeometry(vida*4/10,0.3,0.3)
  let cube = new THREE.Mesh(cubegeometryLife, materialLife);
  cube.position.set(0,4,1)
  objeto.add(cube)
}


function checkWallCollisions(cubes) {
  let collisionP1, collisionP2, collisionP3;
  (cubes || []).forEach((wall) => {
    collisionP1 = assetPlayer.bb.intersectsBox(wall.bb);
    collisionP2 = assettank1.bb.intersectsBox(wall.bb);
    collisionP3 = assettank2.bb.intersectsBox(wall.bb);
    if (collisionP1) {
      checkColisionSideTank(assetPlayer, wall);
      infoBox.changeMessage("Collision detected Player");
    }
    if (collisionP2) {
      checkColisionSideTank(assettank1, wall);
      infoBox.changeMessage("Collision detected tank1");
    }

    if (collisionP3) {
      checkColisionSideTank(assettank2, wall);
      infoBox.changeMessage("Collision detected tank2");
    }

    projectiles.forEach((projectile) => {
      if (projectile.bb.intersectsBox(wall.bb)) {
        colisao(projectile, wall);

        if (projectile.colisoes >= 3) {
          scene.remove(projectile);
          scene.remove(projectile.bb);
        }
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

function movCanhaoCentral()
{
  auxCanhaoCentral.rotateZ(0.01);
  
}


//Funções para movimentar e atirar
function keyboardUpdate() {
  var keyboard = new KeyboardState();
  keyboard.update();
  if (keyboard.pressed("Q")) console.log(auxCanhaoCentral);
  if (keyboard.pressed("A")) {assetPlayer.object.rotateY(rotationSpeed)};
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

  //Altera mapa para nivel 1
  if (keyboard.down("1")) {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    
    mapa_atual = createPlane(1);
  }

   //Altera mapa para nivel 2
  if (keyboard.down("2")) {
    scene.remove(scene);
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    mapa_atual = createPlane(2);
  }
  if (keyboard.down("3")) {
    projectiles.forEach((projectile) => {
      asset.bb.setFromObject(asset.object)
      //console.log(projectile)
      });
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
    camera.position.set(
      midpoint.x,
      midpoint.y - 10,
      10 + DistanciaPlayers + 15 / 3 + (0.5 / window.innerWidth),
    );
    camera.lookAt(midpoint);
  }
}

function calcularDistanciaPlayers() {
  if (
    assetPlayer.object != null &&
    assettank1.object != null &&
    assettank2.object != null
  ) {

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



//Função para iniciar o nível
function createPlane(nivel) {
  //Cria o plano que ficarão os tanques
  const stageMatrix = stageSelector(nivel);
  cubes = []
  assetPlayer.colisoes = 10
  assettank1.colisoes = 10
  assettank2.colisoes = 10
  projectiles = []
  //adicionar iluminação aqui
  scene.add(dirLight);
  scene.add(AmbientLight);


  //Cria um plano branco do tamanho da matriz
  const geometry = new THREE.PlaneGeometry(
    stageMatrix[1].length,
    stageMatrix.length,
  );
  const material = new THREE.MeshPhongMaterial({
    color: "darkgrey",
    side: THREE.DoubleSide,
  });
  const materialCube = new THREE.MeshBasicMaterial({
    color: 0x00af00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  scene.add(plane);

 
  //========= Adiciona elementos na cena(tanques, paredes, poste) ============

  for (var i = 0; i < stageMatrix.length; i++) {
    for (var j = 0; j < stageMatrix[i].length; j++) {
      // Coloca todos os cubos no plano
      if (stageMatrix[i][j] === 1) {
        var cubeGeometry = new THREE.BoxGeometry(32, 1, 1);
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

      if (stageMatrix[i][j] === 14) {
        var cubeGeometry = new THREE.BoxGeometry(1, 21, 1);
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

      if (stageMatrix[i][j] === 15) {
        var cubeGeometry = new THREE.BoxGeometry(1, 6, 1);
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
          -i -3 + stageMatrix.length / 2,
          0.25,
        );
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);
        auxCanhaoCentral = cube;
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 6) {
        let cube = buildPoste();
        cube.position.set(
          j + 0.25 - stageMatrix[i].length / 2,
          -i - 0.25 + stageMatrix.length / 2,
          0,
        );
        //ok
        scene.add(targetPoste1)
        cube.children[0].target = targetPoste1
        //console.log(cube.children[0].target)
        //cube.children[0].target(targ)
        //console.log(cube)
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
        scene.add(targetPoste4)
        cube.children[0].target = targetPoste4
        //console.log(cube.children[0].target)
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
        scene.add(targetPoste2)
        cube.children[0].target = targetPoste2
        //console.log(cube.children[0].target)
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

        //ok
        scene.add(targetPoste3)
        cube.children[0].target = targetPoste3
        //console.log(cube.children[0].target)
        cube.rotateZ(THREE.MathUtils.degToRad(180))
        cube.scale.set(1.4,1.4,1.4)
        scene.add(cube);

      }
      if (stageMatrix[i][j] === 10) {
        let cubegeometrywallUp = new THREE.BoxGeometry(34,1,1)
        let cube = new THREE.Mesh(cubegeometrywallUp, level2WallsMaterial);
        cube.castShadow = true;
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

      }

      if (stageMatrix[i][j] === 11) {
        let cubegeometrywallUp = new THREE.BoxGeometry(2,2,2)
        let cube = new THREE.Mesh(cubegeometrywallUp, level2WallsMaterial);
        cube.castShadow = true;
        cube.position.set(
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          -0.9,
        );
        cubes.push({
          object: cube,
          bb: new THREE.Box3().setFromObject(cube),
        });
        scene.add(cube);
      }

      if (stageMatrix[i][j] === 12) {
        let cubegeometrywallUp = new THREE.BoxGeometry(1,21,1)
        let cube = new THREE.Mesh(cubegeometrywallUp, level2WallsMaterial);
        cube.castShadow = true;
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
      }

      if (stageMatrix[i][j] === 13) {
        let cubegeometrywallUp = new THREE.BoxGeometry(1,8,1)
        let cube = new THREE.Mesh(cubegeometrywallUp, level2WallsMaterial);
        cube.castShadow = true;
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
      }
    }
  }
  return nivel
}
