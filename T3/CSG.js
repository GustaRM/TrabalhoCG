import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer,
        initCamera, 
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize} from "../libs/util/util.js";

import { CSG } from '../libs/other/CSGMesh.js'        

var scene = new THREE.Scene();    // Create main scene
var stats = new Stats();          // To show FPS information

var renderer = initRenderer();    // View function in util/utils
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(4, -8, 8)); // Init camera in this position
   camera.up.set( 0, 0, 1 );

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
//initDefaultBasicLight(scene, true, new THREE.Vector3(12, -15, 20), 28, 1024) ;	

var groundPlane = createGroundPlane(20, 20); // width and height (x, y)
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

var trackballControls = new TrackballControls( camera, renderer.domElement );

// To be used in the interface
let mesh1, mesh2;

mesh1 = buildCanhao();
mesh2 = buildPoste();
mesh2.position.set(0, 0, 0)
mesh1.position.set(-3, 0, 0)
scene.add(mesh1)
scene.add(mesh2)
render();

export function lightMap()
{
   //Iluminação

   let position = new THREE.Vector3(1.0, 0.5, 0.2);
   let lightColor = "rgb(255, 255, 255)";
   let spotLight = new THREE.SpotLight(lightColor, 5.0);
   spotLight.position.copy(position);
   spotLight.angle = THREE.MathUtils.degToRad(45);
   spotLight.castShadown = true;
   return spotLight;
}

export function buildPoste()
{
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
   mesh2.material = new THREE.MeshPhongMaterial({color: 'grey'})
   //mesh2.position.set(0, 0, 0)
   
   return mesh2
}

export function buildCanhao()
{
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


function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
