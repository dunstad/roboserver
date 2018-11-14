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

    let tile = new THREE.Mesh(this.tileGeo, this.tileMat);

    if (this.simple) {
      tile.add(new THREE.LineSegments(this.tileWireGeo, this.wireMat));
    }
    
    tile.position.copy(menuPos);

    tile.lookAt(lookPos);

    group.add(tile);

    this.scene.add(group);

    return group;

  }

}