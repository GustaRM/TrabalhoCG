import * as THREE from  'three';
import { GLTFLoader } from '/three/addons/loaders/GLTFLoader.js';
import {stageSelector} from './stages.js'
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        SecondaryBox,        
        onWindowResize, 
        createGroundPlaneXZ,
        getMaxSize} from "../libs/util/util.js";
import {createTank} from './createTank.js'

const loader = new GLTFLoader();
const gltf = await loader.GLTFLoader("./toon_tank.glb");

let scene, renderer, camera, light, orbit, isOrbitEnabled = false, initialCameraPosition; 
scene = new THREE.Scene();    
renderer = initRenderer();    
camera = initCamera(new THREE.Vector3(0, -20, 30)); 
light = initDefaultBasicLight(scene); 
initialCameraPosition = camera.position.clone();
orbit = new OrbitControls( camera, renderer.domElement ); 
orbit.enabled = isOrbitEnabled;
let midpoint = new THREE.Vector3();

//Teste de colisão
let asset = {
   object: null,
   bb: new THREE.Box3()
};

let assetPlayer2 = {
   object: null,
   bb: new THREE.Box3()
};

let assetProjetil = {
   object: null,
   bb: new THREE.Box3()
};



//Cria e adiciona Player 1 no plano
let cubeplayer1; 
let cubeplayer2; 
let cubes = [];
let projectiles = [];


var mat4 = new THREE.Matrix4();
const degNinety =  THREE.MathUtils.degToRad(90);

var infoBox = new SecondaryBox("");

createPlane(4);
render();

function updateProjectiles(projectiles) {
   projectiles.forEach(projectile => {
      projectile.position.add(projectile.velocity.clone());
   });
}

function checkProjectileCollisions(projectiles, cubeplayer1, cubeplayer2, walls) {
   projectiles.forEach(projectile => {
      if (projectile.bbHelper2.intersectsBox(cubeplayer1.bb)) {
         // 
         cubeplayer1.colisoes=+1;
         // 
      }

      if (projectile.bb.intersectsBox(cubeplayer2.bb)) {
         // 
         cubeplayer2.colisoes=+1;
         // 
      }

      walls.forEach(wall => {
         if (projectile.bb.intersectsBox(wall.bb)) {
            // 
         }
      });
   });
}

function render()
{
   
   updateAsset();
   infoBox.changeMessage("No collision detected");

   updateProjectiles(projectiles,1);
   //checkProjectileCollisions(projectiles,cubeplayer1,cubeplayer2,cubes)

   checkCollisions(cubes);
   keyboardUpdate(); //Movimenta os players
   requestAnimationFrame(render);
   renderer.render(scene, camera) ;
}



function createPlane(nivel){
   
   //Cria o plano que ficarão os tanques
   const stageMatrix = stageSelector(nivel)
   
   //Cria um plano branco do tamanho da matriz
   const geometry = new THREE.PlaneGeometry( stageMatrix[0].length, stageMatrix.length);
   const material = new THREE.MeshBasicMaterial( {color: "darkgrey", side: THREE.DoubleSide} );
   const materialCube = new THREE.MeshBasicMaterial( {color: "grey", side: THREE.DoubleSide} );
   const plane = new THREE.Mesh( geometry, material );
   scene.add( plane );

   var cubeGeometry = new THREE.BoxGeometry(1, 1, 3);
   
   for(var i = 0; i < stageMatrix.length; i++) {  
      for(var j = 0; j < stageMatrix[i].length ; j++) {
         // Coloca todos os cubos no plano
         if(stageMatrix[i][j] === 1){
            let cube = new THREE.Mesh(cubeGeometry, materialCube);
            cube.position.set(j+0.5-(stageMatrix[i].length)/2, -i-0.5+(stageMatrix.length)/2, 0.49);
            cubes.push({
               object: cube,
               bb: new THREE.Box3().setFromObject(cube)
            });
            scene.add(cube);
            //aux = aux+1
         }
         // Coloca o tanque 1 no plano
         if(stageMatrix[i][j] === 2){
            cubeplayer1 = createTank('red');
            asset.object = cubeplayer1;
            
            cubeplayer1.position.set(j+0.5-(stageMatrix[i].length)/2, -i-0.5+(stageMatrix.length)/2, 0.49);
            cubeplayer1.rotateX(degNinety);
            cubeplayer1.rotateY(2*degNinety);
            let bbHelper1 = new THREE.Box3Helper( new THREE.Box3(), "red" );
            cubeplayer1.add(bbHelper1);
            scene.add(cubeplayer1);
         }
         // Coloca o tanque 2 no plano
         if(stageMatrix[i][j] === 3){
            cubeplayer2 = createTank('blue');
            assetPlayer2.object = cubeplayer2;
            cubeplayer2.position.set(j+0.5-(stageMatrix[i].length)/2, -i-0.5+(stageMatrix.length)/2, 0.49);
            cubeplayer2.rotateX(degNinety);
            cubeplayer2.rotateY(2*degNinety);
            let bbHelper2 = new THREE.Box3Helper( new THREE.Box3(), "red" );
            cubeplayer2.add(bbHelper2);
            scene.add(cubeplayer2);
         }    
         if (stageMatrix[i][j] === 4){
            scene.add(gltf.scene)
         }
      }
   }
   
}

function calcularDistanciaPlayers()
{
   const distance = cubeplayer1.position.distanceTo(cubeplayer2.position);
   return distance
}

function pegarposicaonoMundo(object){
   let wp = new THREE.Vector3(); 
   return object.getWorldPosition( wp );
}
const rotationSpeed = 0.03
const moveSpeed = 0.05
function keyboardUpdate() 
{
   var keyboard = new KeyboardState();
   midpoint.add(cubeplayer1.position).add(cubeplayer2.position).divideScalar(3);
   //orbit.target = midpoint;
   //Funções para movimentar e atirar
   keyboard.update();

   //Movimenta tanque 1
   if ( keyboard.pressed("A") )    cubeplayer1.rotateY( rotationSpeed );
   if ( keyboard.pressed("D") )    cubeplayer1.rotateY(  -rotationSpeed );
   if ( keyboard.pressed("S") )    cubeplayer1.translateZ( -moveSpeed );
   if ( keyboard.pressed("W") )    cubeplayer1.translateZ(  moveSpeed );
   if ( keyboard.pressed("left")  && !keyboard.pressed("A") )    cubeplayer1.rotateY( rotationSpeed );
   if ( keyboard.pressed("right") && !keyboard.pressed("D") )    cubeplayer1.rotateY( -rotationSpeed );
   if ( keyboard.pressed("down")  && !keyboard.pressed("S") )    cubeplayer1.translateZ( -moveSpeed );
   if ( keyboard.pressed("up")    && !keyboard.pressed("W") )    cubeplayer1.translateZ(  moveSpeed );

   //Atira tanque 1
   if ( keyboard.down("space") )    projectiles.push(shoot(cubeplayer1, 0.2));

   if ( keyboard.down("1") )    createPlane(1);
   if ( keyboard.down("2") )    createPlane(4);

   //Destrava camera (ao ser acionado novamente volta a camera para a posição anterior)
   if ( keyboard.down("O") ){
      isOrbitEnabled =!isOrbitEnabled;
      orbit.enabled = isOrbitEnabled;

      if (!isOrbitEnabled) {
         camera.position.copy(initialCameraPosition);  
         camera.lookAt(initialCameraPosition);
      }
   }
   let longe = calcularDistanciaPlayers()
   //Mantem a camera olhando sempre para o ponto medio
   if(!isOrbitEnabled){
      camera.position.set(midpoint.x, midpoint.y-10, longe/2+10);
      camera.lookAt(midpoint);
   }
   

  //Aproximação e afasta a camera

   
   
}

//Funções de colisão 


// function createBBHelper(bb, color, tank)
// {
//    // Create a bounding box helper
//    let helper = new THREE.Box3Helper( bb, color );
//    scene.add( helper );
//    return helper;
// }

function updateAsset()
{
   let vec = new THREE.Vector3();
   asset.bb.getCenter(vec);
   asset.bb.setFromObject(asset.object);
   assetPlayer2.bb.getCenter(vec);
   assetPlayer2.bb.setFromObject(assetPlayer2.object);
   // assetProjetil.bb.getCenter(vec);
   // assetProjetil.bb.setFromObject(assetProjetil.object);
}

function checkCollisions(cubes)
{
   (cubes || []).forEach(cube => {
      let collisionP1 = asset.bb.intersectsBox(cube.bb);
      let collisionP2 = assetPlayer2.bb.intersectsBox(cube.bb);
      if(collisionP1) infoBox.changeMessage("Collision detected");
      
      if(collisionP2) infoBox.changeMessage("Collision detected");
      
   })
}

//Teste projetil

function getTankDirection(tank) {
   const direction = tank.getWorldDirection(new THREE.Vector3());
   const xDirection = direction.x;
   const yDirection = direction.y;
   
   direction.set(xDirection, yDirection, 0);
   return direction;
}
 
function createBBHelper(bb, color)
{
   // Create a bounding box helper
   let helper = new THREE.Box3Helper( bb, color );
   scene.add( helper );
   return helper;
}

// Function to shoot a projectile in the direction the tank is facing
function shoot(tank, speed) {
   const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
   const projectileMaterial = new THREE.MeshBasicMaterial({ color: 'white' });

   let projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

   projectile.position.copy(tank.position);
   const projectileDirection = getTankDirection(tank);

   //let bbSphere3 = new THREE.Box3().setFromObject(projectile);
   //let bbHelper3 = createBBHelper(bbSphere3, 'green')
   //bbHelper3.position.copy(projectile.position); 

   //projectile.add(bbHelper3);

   projectile.velocity = projectileDirection.multiplyScalar(speed);
   projectile.colisoes = 0;
   scene.add(projectile);
   return projectile;
}