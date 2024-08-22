import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../libs/util/util.js";
import { setDefaultMaterial } from "../libs/util/util.js";
import { CSG } from '../libs/other/CSGMesh.js'       
var mat4 = new THREE.Matrix4();
const degNinety = THREE.MathUtils.degToRad(90);


function creatTorus() {
  let torusGeometry = new THREE.TorusGeometry(0.283, 0.3, 6, 100);
  let torusMaterial = setDefaultMaterial("black");
  let torus = new THREE.Mesh(torusGeometry, torusMaterial);
  return torus;
}

//Cria a parte superior do tanque
function createSphere(material) {
  let sphereGeometry = new THREE.SphereGeometry(0.55, 32, 16);
  let sphereMaterial = setDefaultMaterial(material);
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  return sphere;
}

//Cria o canhão do tanque
function createCylinder(material) {
  let cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.33, 32);
  let cylinderMaterial = setDefaultMaterial(material);
  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  return cylinder;
}

function translateObject(
  obj,
  translateY,
  translateZ,
  translateX,
  rotateY,
  rotateZ,
) {
  obj.matrixAutoUpdate = false;
  obj.matrix.identity();
  if (rotateY) {
    obj.matrix.multiply(mat4.makeRotationY(degNinety));
  } else if (rotateZ) {
    obj.matrix.multiply(mat4.makeRotationZ(degNinety));
    obj.matrix.multiply(mat4.makeRotationX(degNinety));
  }
  obj.matrix.multiply(mat4.makeTranslation(translateY, translateZ, translateX));
}

export function createTank(tankMaterial) {
  let material = setDefaultMaterial(tankMaterial);

  //Cria o cubo que é a parte principal do tanque
  let cubeGeometry = new THREE.BoxGeometry(1, 1, 1.66);
  let cube = new THREE.Mesh(cubeGeometry, material);

  let torus1 = creatTorus();
  let torus2 = creatTorus();
  let torus3 = creatTorus();
  let torus4 = creatTorus();
  let sphere = createSphere(tankMaterial);
  let cylinder = createCylinder(tankMaterial);

  cube.add(torus1);
  cube.add(torus2);
  cube.add(torus3);
  cube.add(torus4);
  sphere.add(cylinder);
  cube.add(sphere);

  translateObject(torus1, 0.5, 0, 0.66, true, false);
  translateObject(torus2, -0.5, 0, 0.66, true, false);
  translateObject(torus3, -0.5, 0, -0.66, true, false);
  translateObject(torus4, 0.5, 0, -0.66, true, false);
  translateObject(sphere, 0, 0.9, 0, false, false);
  translateObject(cylinder, 0.3, 0.3, 0, false, true);

  return cube;
}

//Cria as rodas do tanque

export function loadGLBFile(scene, asset, file, desiredScale, X, Y, material) {
  let loader = new GLTFLoader();
  loader.load(
    file,
    function (gltf) {
      let obj = gltf.scene;
      obj.traverse(function (child) {
        //console.log(child)
        
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
        }
        
        if (child.name.includes("Tank") && !child.name.includes("Root")) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.color = material.color;
        }
      });

      obj = normalizeAndRescale(obj, desiredScale);
      obj = fixPosition(obj, X, Y);
      obj.updateMatrixWorld(true);
      scene.add(obj);
      let playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      asset.bb.setFromObject(obj);
      //console.log(asset.bb);

      let helper = new THREE.Box3Helper(asset.bb, "red");
      scene.add(helper);

      // Store loaded gltf in our js object
      asset.object = gltf.scene;
    },
    null,
    null,
  );
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale) {
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(
    newScale * (0.8 / scale),
    newScale * (0.8 / scale),
    newScale * (0.8 / scale),
  );
  return obj;
}

function fixPosition(obj, X, Y) {
  // Fix position of the object over the ground plane

  var box = new THREE.Box3().setFromObject(obj);
  obj.translateY(Y);
  obj.translateX(X);
  obj.rotateX(THREE.MathUtils.degToRad(90));
  if (box.min.y > 0) obj.translateY(-box.min.y);
  else obj.translateY(-1 * box.min.y);
  return obj;
}

export function buildPoste()
{
  let mesh2
   let auxMat = new THREE.Matrix4();
   
   // Base objects
   
   let cylinderMesh = new THREE.Mesh( new THREE.CylinderGeometry(0.3, 0.3, 0.1, 40))
   let cylinderMesh2 = new THREE.Mesh( new THREE.CylinderGeometry(0.08, 0.08, 2.5, 20))
   let cylinderMesh3 = new THREE.Mesh( new THREE.CylinderGeometry(0.08, 0.08, 1.3, 20))
   let cylinderMesh4 = new THREE.Mesh( new THREE.CylinderGeometry(0.3, 0.09, 0.3, 20))
   let cylinderMesh5 = new THREE.Mesh( new THREE.CylinderGeometry(0.2, 0.05, 0.3, 20))    

   // CSG holders
   let csgObject, cylinderCSG

   
   // Adicionando cubo na base
   cylinderMesh.rotateX(THREE.MathUtils.degToRad(90));
   cylinderMesh2.position.set(0, 0, 1.25)
   cylinderMesh2.rotateX(THREE.MathUtils.degToRad(90));
   cylinderMesh3.position.set(0, 0.6, 2.5)
   cylinderMesh4.position.set(0, 1.3, 2.41)
   cylinderMesh4.rotateX(THREE.MathUtils.degToRad(-45));
   cylinderMesh5.position.set(0, 1.3, 2.41)
   cylinderMesh5.rotateX(THREE.MathUtils.degToRad(-45));

   updateObject(cylinderMesh)
   updateObject(cylinderMesh2)
   updateObject(cylinderMesh3)
   updateObject(cylinderMesh4)
   updateObject(cylinderMesh5)
   
   cylinderCSG = CSG.fromMesh(cylinderMesh2)  
   cylinderMesh = CSG.fromMesh(cylinderMesh)   
   csgObject = cylinderMesh.union(cylinderCSG) 

   cylinderCSG = CSG.fromMesh(cylinderMesh3)  
   cylinderMesh3 = CSG.fromMesh(cylinderMesh3)   
   csgObject = csgObject.union(cylinderCSG) 

   cylinderCSG = CSG.fromMesh(cylinderMesh4)  
   cylinderMesh4 = CSG.fromMesh(cylinderMesh4)   
   csgObject = csgObject.union(cylinderCSG) 

   cylinderCSG = CSG.fromMesh(cylinderMesh5)  
   cylinderMesh5 = CSG.fromMesh(cylinderMesh5)   
   csgObject = csgObject.subtract(cylinderCSG) 
   

  mesh2 = CSG.toMesh(csgObject, auxMat)
  mesh2.material = new THREE.MeshLambertMaterial({color: 'grey'})
  //mesh2.position.set(0, 0, 0)
  //mesh2.add(spotlight)
  //console.log(mesh2)
  const spotlight = lightMap(cylinderMesh4.position)
  mesh2.add(spotlight)
  return mesh2
}

export function buildCanhao()
{
  let mesh1
   let auxMat = new THREE.Matrix4();
   
   // Base objects
   
   let cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
   let cylinderMesh = new THREE.Mesh( new THREE.CylinderGeometry(1.2, 1.5, 0.2, 40))
   let cylinderMesh2 = new THREE.Mesh( new THREE.CylinderGeometry(0.4, 0.4, 3, 20))
   let cylinderMesh3 = new THREE.Mesh( new THREE.CylinderGeometry(0.2, 0, 3, 20))
   let torusMesh = new THREE.Mesh( new THREE.TorusGeometry(0.3, 0.1, 20, 30))   

   // CSG holders
   let csgObject, cubeCSG2, cylinderCSG, torusCSG

   
   // Adicionando cubo na base
   cubeMesh2.position.set(0, 0, 0.5)
   cylinderMesh.rotateX(THREE.MathUtils.degToRad(90));
   updateObject(cubeMesh2) // update internal coords
   updateObject(cylinderMesh)
   cubeCSG2 = CSG.fromMesh(cubeMesh2)  
   cylinderMesh = CSG.fromMesh(cylinderMesh)   
   csgObject = cylinderMesh.union(cubeCSG2) 
   
   // Adicionando Cilindro de cima
   cylinderMesh2.position.set(0, 0.4, 1.1)
   updateObject(cylinderMesh2)
   cylinderCSG = CSG.fromMesh(cylinderMesh2)  
   csgObject = csgObject.union(cylinderCSG) 

   // Abrindo o Cilindo no centro
   cylinderMesh3.position.set(0, 0.4, 1.1)
   updateObject(cylinderMesh3)
   cylinderCSG = CSG.fromMesh(cylinderMesh3)  
   csgObject = csgObject.subtract(cylinderCSG) 

   torusMesh.position.set(0, 1.9, 1.1)
   torusMesh.rotateX(THREE.MathUtils.degToRad(90));
   updateObject(torusMesh)
   torusCSG = CSG.fromMesh(torusMesh)  
   csgObject = csgObject.union(torusCSG)

   mesh1 = CSG.toMesh(csgObject, auxMat)
   mesh1.material = new THREE.MeshPhongMaterial({color: 'grey'})
   //mesh1.position.set(-3, 0, 0)

   return mesh1
}

function updateObject(mesh)
{
   mesh.matrixAutoUpdate = false;
   mesh.updateMatrix();
}

export function lightMap(posicao)
{
  //angulospot = THREE.MathUtils.degToRad(90)
   let position = new THREE.Vector3(0, 1.6, 1.4);
   let lightColor = "rgb(255, 255, 255)";
   let spotLight = new THREE.SpotLight(lightColor, 10,10);
   spotLight.position.copy(position);
   spotLight.castShadown = true;
  // spotLight.shadow.mapSize.width = 512; // default
  // spotLight.shadow.mapSize.height = 512; // default
  // spotLight.shadow.camera.near = 0.5; // default
  // spotLight.shadow.camera.far = 500; // default
  // spotLight.shadow.focus = 1; // default

  // spotLight.shadow.camera.near = 100;
  // spotLight.shadow.camera.far = 100;
  // spotLight.shadow.camera.fov = 10;

   return spotLight
}