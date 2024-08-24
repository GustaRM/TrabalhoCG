import * as THREE from "three";

function updateObject(object) {
   object.position.set(object.position.x + object.position.velocity.x, object.position.y + object.position.velocity.y, 0);
   object.bb.setFromObject(object)
}

function checkColisionSide(object, wall) 
{
   var BoxAux = new THREE.Box3();
   BoxAux.copy(object.bb);
   BoxAux.max.y = (object.bb.max.y+object.velocity.y)
   BoxAux.min.y = (object.bb.min.y+object.velocity.y)
   //console.log(BoxAux)   
   // Check colision with the wall on Y axis
   if (BoxAux.intersectsBox(wall.bb)) // colidiu no sentido Y do tiro
   {
      console.log("ColisãoY")
      //projectile.velocity.x = -projectile.velocity.x;
      //object.velocity.y = -object.velocity.y;
      BoxAux.max.y = (object.bb.max.y-2*object.velocity.y)
      BoxAux.min.y = (object.bb.min.y-2*object.velocity.y)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido Y do tiro
      {
         console.log("duplaY")
      }
      else 
      {
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
      console.log("ColisãoX")
      //projectile.velocity.x = -projectile.velocity.x;
      //object.velocity.y = -object.velocity.y;
      BoxAux.max.x = (object.bb.max.x-2*object.velocity.x)
      BoxAux.min.x = (object.bb.min.y-2*object.velocity.x)
      if (BoxAux.intersectsBox(wall.bb)) // colidiu no contrario sentido X do tiro
      {
         console.log("duplaX")
      }
      else 
      {
         object.velocity.x = -object.velocity.x;
         object.position.x = object.position.x + object.velocity.x;
      }
   }
   else
   {
      object.position.y
   }



   
   //console.log(projectile);
}

export function colisao ( projectile , wall ) {
   projectile.bb.intersectsBox(wall.bb);
   if (projectile.colisao > 3)
   {
   }
   else
   {
      projectile.colisoes++;
      checkColisionSide(projectile, wall);
   }
}