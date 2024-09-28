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
import { Color, DirectionalLight, MeshLambertMaterial, Vector3 } from "../build/three.module.js";
import { createTank, loadGLBFile, buildCanhao, buildPoste } from "./createTank.js";
import { checkColisionSideTank, colisao } from "./colision.js";
//import {buildPoste , buildCanhao} from "./PosteCanhaoCSG.js";
let UltimoTiro = Date.now();
let stageLevel = 1;
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


//direção luz poste
const targetPoste1 = new THREE.Object3D()
targetPoste1.position.set(-9,4,-3)

const targetPoste2 = new THREE.Object3D()
targetPoste2.position.set(3,-2,-7)
const targetPoste3 = new THREE.Object3D()
targetPoste3.position.set(-2,2,-10)

const targetPoste4 = new THREE.Object3D()
targetPoste4.position.set(-2,-1,-10)


// Audios =============================================
const listener = new THREE.AudioListener();
listener.autoplay = true
camera.add( listener );
const sound = new THREE.Audio( listener );
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sons/imperial.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.01 );
  sound.play();
});

const listenerShoot = new THREE.AudioListener();
listenerShoot.autoplay = true
camera.add( listenerShoot );
const soundShoot = new THREE.Audio( listenerShoot );
const audioLoaderShoot = new THREE.AudioLoader();
audioLoaderShoot.load( 'sons/tankshot.mp3', function( buffer ) {
  soundShoot.setBuffer( buffer );
  soundShoot.setVolume( 0.03 );
  soundShoot.detune -= 1000
});

const listenerExplosion = new THREE.AudioListener();
listenerExplosion.autoplay = true
camera.add( listenerExplosion );
const soundExplosion = new THREE.Audio( listenerExplosion );
const audioLoaderExplosion = new THREE.AudioLoader();
audioLoaderExplosion.load( 'sons/explosion.mp3', function( buffer ) {
  soundExplosion.setBuffer( buffer );
  soundExplosion.setVolume( 0.03 );
  soundExplosion.detune -= 1000
});


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
const level3WallsMaterial = new THREE.MeshLambertMaterial({color: "blue"})
const levelConectorMaterial = new THREE.MeshLambertMaterial({color: "red"})
const sliderMaterial = new THREE.MeshLambertMaterial({color: "yellow"})
let cubes = [];
let projectiles = [];
let movingwalls = [];
var infoBox = new SecondaryBox("");
var auxCanhaoCentral;
var godMode = false
var audioMode = true

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


let assettank3 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

let assettank4 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};


let assettank5 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

let assettank6 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};


let assettank7 = {
  object: null,
  colisoes: 10,
  bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
};

const P = 99
const C = 98



mapa_atual =  createPlane(3);
render();

function tanksController(){
  if(stageLevel == 1)
  {
    assettank1.object.rotateZ(0.01);
    assettank2.object.rotateZ(0.01);
  }
  else if (stageLevel == 3)
  {
  //  assettank3.object.rotateZ(0.01);
  //  assettank4.object.rotateZ(0.01);
  }
  else if (stageLevel == 4) {
  //  assettank5.object.rotateZ(0.01);
  //  assettank6.object.rotateZ(0.01);
  //  assettank7.object.rotateZ(0.01);
  }
  if( Date.now() - UltimoTiro > 3000)
  {
    

    if (assettank1.colisoes > 0){
      projectiles.push(shoot(assettank1.object, 0.15, scene));
      if (audioMode == true){
        soundShoot.stop()
        soundShoot.play()
       
      }
    }
    if (assettank2.colisoes > 0){
    projectiles.push(shoot(assettank2.object, 0.15, scene));
    if (audioMode == true){
      soundShoot.stop()
      soundShoot.play()
      
    }
    }
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
    updateAsset();
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

      if (audioMode == true )
      {
        soundExplosion.stop();
        soundExplosion.setVolume(0.1);
        soundExplosion.play();
      }
      
      scene.remove(projectile.bb);
      scene.remove(projectile);
      
      if (godMode == false)
      {
        assetPlayer.colisoes -= 1;
      }
      //console.log("sucesso")
    }
    
    if (assettank1.bb.intersectsBox(projectile.bb)) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
      scene.remove(projectile.bb);
      scene.remove(projectile);
      if (audioMode == true )
      {
        soundExplosion.stop();
        soundExplosion.setVolume(0.05);
        soundExplosion.play();
      }
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
      if (audioMode == true )
      {
        soundExplosion.stop();
        soundExplosion.setVolume(0.05);
        soundExplosion.play();
      }
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

  stageController();
  updateTankAssets();
  updateProjectile();
  controllerCanhaoCental();

}

function updateProjectile() {
  projectiles.forEach((projectile) => {
    projectile.bb.setFromObject(projectile)
    //console.log(projectile.bb);
  })};


  function updateTankAssets() {
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
          projectiles.splice(projectiles.indexOf(projectile), 1);
          scene.remove(projectile);
          scene.remove(projectile.bb);
        }
      }
    });
  });
  (movingwalls || []).forEach((wallmov) => {
    collisionP1 = assetPlayer.bb.intersectsBox(wallmov.bb);
    collisionP2 = assettank1.bb.intersectsBox(wallmov.bb);
    collisionP3 = assettank2.bb.intersectsBox(wallmov.bb);
    if (collisionP1) {
      checkColisionSideTank(assetPlayer, wallmov);
      infoBox.changeMessage("Collision detected Player");
    }
    if (collisionP2) {
      checkColisionSideTank(assettank1, wallmov);
      infoBox.changeMessage("Collision detected tank1");
    }

    if (collisionP3) {
      checkColisionSideTank(assettank2, wallmov);
      infoBox.changeMessage("Collision detected tank2");
    }

    projectiles.forEach((projectile) => {
      if (projectile.bb.intersectsBox(wallmov.bb)) {
        colisao(projectile, wallmov);

        if (projectile.colisoes >= 3) {
          projectiles.splice(projectiles.indexOf(projectile), 1);
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

function controllerCanhaoCental()
{
  auxCanhaoCentral.rotateZ(0.01);
  
}


//Funções para movimentar e atirar
function keyboardUpdate() {
  var keyboard = new KeyboardState();
  keyboard.update();
  if (keyboard.pressed("Q")) console.log(assetPlayer.object.position);
  if (keyboard.pressed("A")) {assetPlayer.object.rotateY(rotationSpeed)};
  if (keyboard.pressed("D")) assetPlayer.object.rotateY(-rotationSpeed);
  if (keyboard.pressed("S")) assetPlayer.object.translateZ(-moveSpeed);
  if (keyboard.pressed("W")) assetPlayer.object.translateZ(moveSpeed);
  if (keyboard.down("G")) {
    godMode = !godMode;
    if (godMode == true)
      {
        const auxColor = new THREE.Color("white");
        assetPlayer.object.traverse(function (child) {
          if (child.name.includes("Tank") && !child.name.includes("Root")) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.material) { // Check if the child has a material
              child.material.color.set(auxColor); // Change the color of the existing material
            }
          }
        });
    }
    else 
    {
      const auxColor = new THREE.Color("green");
        assetPlayer.object.traverse(function (child) {
          if (child.name.includes("Tank") && !child.name.includes("Root")) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.material) { // Check if the child has a material
              child.material.color.set(auxColor); // Change the color of the existing material
            }
          }
        });
    }
  
  }
  if (keyboard.down("P")) 
  {
    audioMode = !audioMode;
    if (audioMode == false){
      if(sound.isPlaying == true){
        sound.stop()
      }
      soundExplosion.stop();
      soundShoot.stop();
    }
    if (audioMode == true)
      sound.play()
  }
  if (keyboard.pressed("left") && !keyboard.pressed("A"))
    assetPlayer.object.rotateY(rotationSpeed);
  if (keyboard.pressed("right") && !keyboard.pressed("D"))
    assetPlayer.object.rotateY(-rotationSpeed);
  if (keyboard.pressed("down") && !keyboard.pressed("S"))
    assetPlayer.object.translateZ(-moveSpeed);
  if (keyboard.pressed("up") && !keyboard.pressed("W"))
    assetPlayer.object.translateZ(moveSpeed);
  
  //Atira tanque 1
  if (keyboard.down("space")){
    projectiles.push(shoot(assetPlayer.object, 0.15, scene));
    if (audioMode == true )
    {
      soundShoot.stop()
      soundShoot.play()
    }
  }
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
    scene.remove(scene);
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    mapa_atual = createPlane(3);
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
    if (assetPlayer.object != null){

      camera.position.set(
        assetPlayer.object.position.x,
        assetPlayer.object.position.y-10,
        17,
      );
      camera.lookAt(assetPlayer.object.position);
    }
    else
    {
      camera.position.set(0,0,17);
      camera.lookAt(0,0,0);
    }
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

  if (nivel == 1) {
    stageLevel = 1;
  }
  if (nivel == 2) {
    stageLevel = 3;
  }
  if (nivel == 3) {
    stageLevel = 5;
  }

  const stageMatrix = stageSelector(nivel);
  movingwalls = []
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
  const level1WallsMaterial = new THREE.MeshBasicMaterial({
    color: 0x00af00,
    side: THREE.DoubleSide,
  });

  // Create a directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Color and intensity

  // Set the position of the light
  directionalLight.position.set(-15, 17, 20); // x, y, z coordinates

  // Optionally, you can also set the direction of the light
  directionalLight.target.position.set(0, 0, 0); // Where the light should point
  directionalLight.castShadow = true; 
  directionalLight.shadow.camera.left = -140;  // Extend left boundary
  directionalLight.shadow.camera.right = 140;  // Extend right boundary
  directionalLight.shadow.camera.top = 140;    // Extend top boundary
  directionalLight.shadow.camera.bottom = -140; // Extend bottom boundary
  directionalLight.shadow.mapSize.width = 8192; // Default is 512
  directionalLight.shadow.mapSize.height = 8192;

  // Optional: Adjust near and far planes of the shadow camera
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 60;

  // Add the light to the scene
  scene.add(directionalLight);

  // Optionally, add the target object to the scene (if you want to control the direction)
  scene.add(directionalLight.target);

  const texture = new THREE.TextureLoader().load( 'texturas/floorWood.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( stageMatrix[1].length, stageMatrix.length );
  const cubeText =  new THREE.MeshLambertMaterial();
  cubeText.map = texture;
  const plane = new THREE.Mesh(geometry, cubeText);
  plane.receiveShadow = true;
  scene.add(plane);

 
  //========= Adiciona elementos na cena(tanques, paredes, poste) ============

  for (var i = 0; i < stageMatrix.length; i++) {
    for (var j = 0; j < stageMatrix[i].length; j++) {
      // Coloca todos os componentes da fase
      
      if (stageMatrix[i][j] === 4) {
        var cubeGeometry = new THREE.BoxGeometry(1, 5, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/grass.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 5 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 7 || stageMatrix[i][j] === 6) {
        var cubeGeometry = new THREE.BoxGeometry(1, 3, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 3 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
        cube.castShadow = true;
        cube.position.set(
          j +0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          0.49,
        );
        if (stageMatrix[i][j] === 6){
          
        movingwalls.push({
          object: cube,
          bb: new THREE.Box3().setFromObject(cube),
          tipo: 1
        })}
        else {
          movingwalls.push({
            object: cube,
            bb: new THREE.Box3().setFromObject(cube),
            tipo: 2
          });
        }
        scene.add(cube);
        //aux = aux+1
      }

      if (stageMatrix[i][j] === 1) {
        var cubeGeometry = new THREE.BoxGeometry(17, 1, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stone.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 17, 1 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }

      if (stageMatrix[i][j] === 11) {
        var cubeGeometry = new THREE.BoxGeometry(1, 3, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stone.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 3 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }

      if (stageMatrix[i][j] === 14) {
        var cubeGeometry = new THREE.BoxGeometry(1, 11, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stone.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 11 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }

      //stage 2 Walls
      if (stageMatrix[i][j] === 20) {
        var cubeGeometry = new THREE.BoxGeometry(18, 1, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/crate.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 18, 1 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
        cube.castShadow = true;
        cube.position.set(
          j + 0 - stageMatrix[i].length / 2,
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
      if (stageMatrix[i][j] === 21) {
        var cubeGeometry = new THREE.BoxGeometry(1, 3, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/crate.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 3 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 22) {
        var cubeGeometry = new THREE.BoxGeometry(1, 4, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/crate.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 4 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }

      if (stageMatrix[i][j] === 5) {
        var cubeGeometry = new THREE.BoxGeometry(2, 2, 0.25);
        const texture = new THREE.TextureLoader().load( 'texturas/crate.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 2, 2 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
        cube.castShadow = true;
        cube.position.set(
          j + 1 - stageMatrix[i].length / 2,
          -i - 1 + stageMatrix.length / 2,
          0.125,
        );
        cubes.push({
          object: cube,
          bb: new THREE.Box3().setFromObject(cube),
        });
        scene.add(cube);
      }




      //stage 3 walls

      if (stageMatrix[i][j] === 32) {
        var cubeGeometry = new THREE.BoxGeometry(22, 1, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 22, 1 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
        cube.castShadow = true;
        cube.position.set(
          j  - stageMatrix[i].length / 2,
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
      if (stageMatrix[i][j] === 31) {
        var cubeGeometry = new THREE.BoxGeometry(1, 15, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 15 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 33) {
        var cubeGeometry = new THREE.BoxGeometry(1, 3, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 3 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 34) {
        var cubeGeometry = new THREE.BoxGeometry(1, 5, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 5 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 35) {
        var cubeGeometry = new THREE.BoxGeometry(1, 3, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/stonewall.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 5 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 41) {
        var cubeGeometry = new THREE.BoxGeometry(3, 1, 1);
        const texture = new THREE.TextureLoader().load( 'texturas/grass.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 3, 1 );
        const cubeText =  new THREE.MeshLambertMaterial();
        cubeText.map = texture;
        let cube = new THREE.Mesh(cubeGeometry, cubeText);
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
        //aux = aux+1
      }
      /*
      if (stageMatrix[i][j] === 15) {
        var cubeGeometry = new THREE.BoxGeometry(1, 6, 1);
        let cube = new THREE.Mesh(cubeGeometry, level1WallsMaterial);
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
      */
      // Coloca o tanque 1 no plano
      if (stageMatrix[i][j] === 90) {
        loadGLBFile(
          scene,
          assetPlayer,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          playerMaterial,
        );
      }
      // Coloca o tanque 2 no plano
      if (stageMatrix[i][j] === 92) {
        loadGLBFile(
          scene,
          assettank1,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }
      if (stageMatrix[i][j] === 93) {
        loadGLBFile(
          scene,
          assettank2,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank2Material,
        );
      }
      if (stageMatrix[i][j] === 94) {
        loadGLBFile(
          scene,
          assettank3,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }if (stageMatrix[i][j] === 95) {
        loadGLBFile(
          scene,
          assettank4,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }if (stageMatrix[i][j] === 96) {
        loadGLBFile(
          scene,
          assettank5,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }if (stageMatrix[i][j] === 97) {
        loadGLBFile(
          scene,
          assettank6,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }if (stageMatrix[i][j] === 98) {
        loadGLBFile(
          scene,
          assettank7,
          "../assets/objects/toontanktrab2.glb",
          1.5,
          j + 0.5 - stageMatrix[i].length / 2,
          -i - 0.5 + stageMatrix.length / 2,
          tank1Material,
        );
      }
      if (stageMatrix[i][j] === 30) {
        let cube = buildCanhao();
        cube.castShadow = true;
        cube.position.set(
          j + 1 - stageMatrix[i].length / 2,
          -i -2 + stageMatrix.length / 2,
          0.25,
        );
        cube.scale.set(0.7,0.7,0.7)
        scene.add(cube);
        auxCanhaoCentral = cube;
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 26) {
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
        cube.scale.set(0.7,0.7,0.7)
        cube.castShadow = true;
        scene.add(cube);
        //aux = aux+1
      }
      if (stageMatrix[i][j] === 27) {
        let cube = buildPoste();
        cube.position.set(
          j + 1.0 - stageMatrix[i].length / 2,
          -i - 0.9 + stageMatrix.length / 2,
          0,
        );
        cube.castShadow = true;
        scene.add(targetPoste4)
        cube.children[0].target = targetPoste4
        //console.log(cube.children[0].target)
        cube.scale.set(0.7,0.7,0.7)
        
        scene.add(cube);
      }
      if (stageMatrix[i][j] === 28) {
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
        cube.scale.set(0.7,0.7,0.7)
        cube.castShadow = true;
        scene.add(cube);
      }
      if (stageMatrix[i][j] === 29) {
        let cube = buildPoste();
        cube.position.set(
          j - 0 - stageMatrix[i].length / 2,
          -i - 0.05 + stageMatrix.length / 2,
          0,
        );

        //ok
        scene.add(targetPoste3)
        cube.children[0].target = targetPoste3
        //console.log(cube.children[0].target)
        cube.rotateZ(THREE.MathUtils.degToRad(180))
        cube.scale.set(0.7,0.7,0.7)
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
    }
  }
  return nivel
}

function gateMovement(gate,up){
  if (stageLevel == 2){
    
    if (up){
      if (gate.object.position.y < 1)
        gate.object.position.y += 0.01
    }
    if (!up){
      if (gate.object.position.y < -1.5){
        gate.object.position.y -= 0.01
      }
    }
  }

}

function stageController(){
  if( assetPlayer.object != null){

    if (stageLevel == 1){
      if (assettank1.colisoes < 1){
          stageLevel = 2
  
          //codigo pros portoes abrirem
  
      }
    }
    if(assetPlayer.object.position.x > -13.5){
      stageLevel = 3
  
      // codigo para fechar portoes fase 1 e abrir portoes da fase 2
    }
    if (stageLevel == 2){
      if (assetPlayer.position.x > -9.5) {
        stageLevel = 3
  
        //codigo para fechar portoes fase 2 e ativar ia dos tanques da fase 2
  
      }
    }
    if (stageLevel == 3){
      if (assettank2.colisoes < 1){
        if(assettank3.colisoes < 1){
          stageLevel = 4
          //codigo para abrir portoes da fase 2 para a 3
        }
      }
    }
    if (stageLevel == 4){
      if (assetPlayer.position.x > 7.3){
        stageLevel = 5
        //codigo para abrir portoes da fase 3
  
      }
    }
    if (stageLevel == 5){
      if(assetPlayer.object.position.x > 11.5)
      stageLevel = 6
      
    }
    if (stageLevel == 6){
      if (assettank4.colisoes < 1){
        if(assettank5.colisoes < 1){
          if(assettank6.colisoes < 1){
            
            //codigo para colocar a tela de vitoria
          }
        }
      }
      //codigo para voltar para o menu
    }
  }

}
