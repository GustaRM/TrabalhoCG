import * as THREE from "three";

function updateObject(object) {
   object.position.set(object.position.x + object.position.velocity.x, object.position.y + object.position.velocity.y, 0);
   object.bb.setFromObject(object)
}

function getTankDirection(tank) {
   console.log(tank)
   const direction = tank.getWorldDirection(new THREE.Vector3());
   const xDirection = direction.x;
   const yDirection = direction.y;
 
   direction.set(xDirection, yDirection, 0);
   return direction;
 }

function checkColisionSide(object, wall) 
{
   var BoxAux = new THREE.Box3();
   BoxAux.copy(object.bb);
   //const aux=getTankDirection(object)
   //console.log(object)
   BoxAux.max.y = (object.bb.max.y+object.velocity.y)
   BoxAux.min.y = (object.bb.min.y+object.velocity.y)
   //console.log(BoxAux)   
   // Check colision with the wall on Y axis
   if (BoxAux.intersectsBox(wall.bb)) // colidiu no sentido Y do tiro
   {
      //console.log("ColisãoY")
      //projectile.velocity.x = -projectile.velocity.x;
      BoxAux.copy(object.bb);
      BoxAux.max.y = (object.bb.max.y-object.velocity.y)
      BoxAux.min.y = (object.bb.min.y-object.velocity.y)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido Y do tiro
      {
         //console.log("duplaY")
      }
      else 
      {
         //console.log("simplesY")
         object.velocity.y = -object.velocity.y;
         object.position.y = object.position.y + object.velocity.y;
      }
   }

   BoxAux.copy(object.bb);
   BoxAux.max.x = (object.bb.max.x+object.velocity.x)
   BoxAux.min.x = (object.bb.min.x+object.velocity.x)
   //console.log(BoxAux)   
   // Check colision with the wall on X axis
   if (BoxAux.intersectsBox(wall.bb)) // colidiu no sentido X do tiro
   {
      //console.log("ColisãoX")
      //projectile.velocity.x = -projectile.velocity.x;
      //object.velocity.y = -object.velocity.y;
      BoxAux.copy(object.bb);
      BoxAux.max.x = (object.bb.max.x-object.velocity.x)
      BoxAux.min.x = (object.bb.min.x-object.velocity.x)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido X do tiro
      {
         //console.log("duplaX")
      }
      else 
      {
         //console.log("simplesX")
         object.velocity.x = -object.velocity.x;
         object.position.x = object.position.x + object.velocity.x;
      }
   }
   else
   {
      object.position.y
   }
}

export function checkColisionSideTank(tank, wall) 
{
   const tankdirection = getTankDirection(tank.object);
   tankdirection.multiplyScalar(0.15);
   console.log(tankdirection)
   var BoxAux = new THREE.Box3();
   BoxAux.copy(tank.bb);
   console.log(BoxAux)
   console.log(tank)
   BoxAux.max.y = (tank.bb.max.y+tankdirection.y)
   BoxAux.min.y = (tank.bb.min.y+tankdirection.y)
   if (BoxAux.intersectsBox(wall.bb)) // colidiu no sentido Y do tiro
   {
      BoxAux.copy(tank.bb);
      BoxAux.max.y = (tank.bb.max.y-tankdirection.y)
      BoxAux.min.y = (tank.bb.min.y-tankdirection.y)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido Y do tiro
      {
         console.log("duplaY")
      }
      else 
      {
         console.log("simplesY")
         tank.object.position.y = tank.object.position.y - tankdirection.y;
      }
   }
   else
   {
      console.log("não sei")
      tank.object.position.y = tank.object.position.y + tankdirection.y
   }
   BoxAux.copy(tank.bb);
   BoxAux.max.x = (tank.bb.max.x+tankdirection.x)
   BoxAux.min.x = (tank.bb.min.x+tankdirection.x)
   if (BoxAux.intersectsBox(wall.bb)) // colidiu no sentido X do tiro
   {
      BoxAux.copy(tank.bb);
      BoxAux.max.x = (tank.bb.max.x-tankdirection.x)
      BoxAux.min.x = (tank.bb.min.x-tankdirection.x)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido X do tiro
      {
         //console.log("duplaX")
      }
      else 
      {
        //console.log("simplesX")
         tank.object.position.x -= tankdirection.x;
      }
   }
   else
   {
      console.log("não sei")
      tank.object.position.x += tankdirection.x;
   }
}

export function colisao ( projectile , wall ) {
   projectile.colisoes++;
   checkColisionSide(projectile, wall);
}