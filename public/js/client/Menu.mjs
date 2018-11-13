/**
 * Used to create various menu arrangements easily.
 */
export class Menu {

  /**
   * Used to give the class the information it needs to make menus.
   * @param {THREE.Geometry} tileGeo 
   * @param {THREE.Material} tileMat 
   * @param {THREE.Scene} scene 
   */
  constructor(tileGeo, tileMat, scene) {

    this.tileGeo = tileGeo;
    this.tileMat = tileMat;
    this.scene = scene;

  }

  /**
   * Used to add a new menu to the scene.
   * @param {THREE.Vector3} pos 
   * @param {number} numTiles 
   * @returns {THREE.Group}
   */
  create(pos, numTiles) {
    
    let group = new THREE.Group();

    let tile = new THREE.Mesh(this.tileGeo, this.tileMaterial));
    
    tile.position.copy(pos);

    group.add(tile);

    this.scene.add(group);

    return group;

  }

}