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

    let tilePadding = .5;

    this.arrangements = {
      
      1: [
        new THREE.Vector2(0, 0),
      ],
      
      2: [
        new THREE.Vector2(-.5 - tilePadding / 2, 0),
        new THREE.Vector2(.5 + tilePadding / 2, 0),
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

    group.position.copy(menuPos);
    group.lookAt(lookPos);

    for (let tileOffset of this.arrangements[numTiles]) {

      let tile = new THREE.Mesh(this.tileGeo, this.tileMat);
  
      group.add(tile);
      
      if (this.simple) {
        tile.add(new THREE.LineSegments(this.tileWireGeo, this.wireMat));
      }
      
      // convert offset to tile space
      let offset3D = new THREE.Vector3(tileOffset.x, 0, tileOffset.y);
      offset3D.multiplyScalar(this.tileGeo.parameters.height); // same as voxelSideLength
      
      // apply offset
      tile.position.copy(offset3D);
      
    }

    this.scene.add(group);

    return group;

  }

}