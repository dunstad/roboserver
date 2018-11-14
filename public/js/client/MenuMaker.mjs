/**
 * Used to create various menu arrangements easily.
 */
export class MenuMaker {

  /**
   * Used to give the class the information it needs to make menus.
   * @param {THREE.Geometry} tileGeo 
   * @param {THREE.Material} tileMat 
   * @param {THREE.Scene} scene 
   */
  constructor(tileGeo, tileWireGeo, tileMat, wireMat, scene, simple) {

    this.tileGeo = tileGeo;
    this.tileWireGeo = tileWireGeo;
    this.tileMat = tileMat;
    this.wireMat = wireMat;
    this.scene = scene;
    this.simple = simple;

    this.arrangements = {
      
      1: [
        new THREE.Vector2(0, 0),
      ],
      
      2: [
        new THREE.Vector2(-.5, 0),
        new THREE.Vector2(.5, 0),
      ],
    }

  }

  /**
   * Used to add a new menu to the scene.
   * @param {THREE.Vector3} menuPos 
   * @param {THREE.Vector3} lookPos 
   * @param {number} numTiles 
   * @returns {THREE.Group}
   */
  create(menuPos, lookPos, numTiles) {
    
    let group = new THREE.Group();

    for (let tileOffset of this.arrangements[numTiles]) {

      let tile = new THREE.Mesh(this.tileGeo, this.tileMat);
  
      if (this.simple) {
        tile.add(new THREE.LineSegments(this.tileWireGeo, this.wireMat));
      }

      tile.position.copy(menuPos);
  
      tile.lookAt(lookPos);

      // convert offset to tile space
      let offset3D = new THREE.Vector3(tileOffset.x, tileOffset.y, 0);
      offset3D.multiplyScalar(this.tileGeo.parameters.height); // same as voxelSideLength
      offset3D = tile.localToWorld(offset3D);
      
      // apply offset
      tile.position.add(offset3D);

      group.add(tile);

    }

    this.scene.add(group);

    return group;

  }

}