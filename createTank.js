import * as THREE from  'three';
import { setDefaultMaterial } from "../libs/util/util.js";
    var mat4 = new THREE.Matrix4();
    const degNinety =  THREE.MathUtils.degToRad(90);
    
function creatTorus(){
    let torusGeometry = new THREE.TorusGeometry(0.283,0.3,6,100);
    let torusMaterial = setDefaultMaterial('black');
    let torus = new THREE.Mesh(torusGeometry, torusMaterial);
    return torus;
}
 
 //Cria a parte superior do tanque
function createSphere(material){
    let sphereGeometry = new THREE.SphereGeometry(0.55,32,16);
    let sphereMaterial = setDefaultMaterial(material);
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    return sphere;
}
 
 //Cria o canhão do tanque
function createCylinder(material){
    let cylinderGeometry = new THREE.CylinderGeometry(0.1,0.1,1.33,32);
    let cylinderMaterial = setDefaultMaterial(material);
    let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    return cylinder;
}

function translateObject(obj, translateY, translateZ, translateX, rotateY, rotateZ){

    obj.matrixAutoUpdate = false;
    obj.matrix.identity();
    if(rotateY){
      obj.matrix.multiply(mat4.makeRotationY(degNinety));
    } else if (rotateZ){
      obj.matrix.multiply(mat4.makeRotationZ(degNinety));
      obj.matrix.multiply(mat4.makeRotationX(degNinety));
    }
    obj.matrix.multiply(mat4.makeTranslation(translateY, translateZ, translateX))

}

export function createTank(tankMaterial){
   
   
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
 
    translateObject(torus1,0.5,0,0.66,true,false);
    translateObject(torus2,-0.5,0,0.66,true,false);
    translateObject(torus3,-0.5,0,-0.66,true,false);
    translateObject(torus4,0.5,0,-0.66,true,false);
    translateObject(sphere, 0,0.9,0,false,false);
    translateObject(cylinder, 0.3, 0.3, 0, false, true);
 
    return cube;
 
 }
 
 //Cria as rodas do tanque
 