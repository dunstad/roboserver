/**
 * Used to create various menu arrangements easily.
 */
export class MenuMaker {

  /**
   * Used to give the class the information it needs to make menus.
   * @param {MapRender} mapRender 
   */
  constructor(mapRender) {


  }

  /**
   * Used to add a new menu to the scene.
   * @param {THREE.Vector3} menuPos 
   * @param {THREE.Vector3} lookPos 
   * @param {number} numTiles 
   * @returns {THREE.Group}
   */
  create(menuPos, lookPos, numTiles) {
    

    for (let tileOffset of this.arrangements[numTiles]) {

      // convert offset to tile space
      let offset3D = new THREE.Vector3(tileOffset.x, tileOffset.y, 0);
      offset3D.multiplyScalar(this.tileGeo.parameters.height); // same as voxelSideLength
      
    }

    return group;

  }

}