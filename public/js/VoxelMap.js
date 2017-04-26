/**
 * An organized way to store the voxels of a terrain map.
 */
class VoxelMap {

  /**
   * An organized way to store the voxels of a terrain map.
   */
  constructor() {
    this.map = {};
  }

  /**
   * Retrieve a voxel from the map if it exists.
   * @param {WorldAndScenePoint} point
   * @returns {THREE.Mesh | false}
   */
  get(point) {
    var worldPoint = point.world();
    var x = worldPoint.x;
    var y = worldPoint.y;
    var z = worldPoint.z;
    var result;
    if (this.map[x] && this.map[x][y] && this.map[x][y][z]) {
      result = this.map[x][y][z];
    }
    else {result = false;}
    return result;
  }

  /**
   * Store a voxel in the map or remove one from it.
   * @param {WorldAndScenePoint} point
   * @param {THREE.Mesh} voxel 
   * @returns {THREE.Mesh}
   */
  set(point, voxel) {
    var worldPoint = point.world();
    var x = worldPoint.x;
    var y = worldPoint.y;
    var z = worldPoint.z;
    if (!this.map[x]) {this.map[x] = {};}
    if (!this.map[x][y]) {this.map[x][y] = {};}
    this.map[x][y][z] = voxel;
    return voxel;
  }

  /**
   * Call this function on every voxel in the map.
   * @param {function} func 
   */
  forEach(func) {
    for (var xIndex in this.map) {
      for (var yIndex in this.map[xIndex]) {
        for (var zIndex in this.map[xIndex][yIndex]) {
          var point = new WorldAndScenePoint(xIndex, yIndex, zIndex, true);
          var voxel = this.get(point);
          if (voxel) {func(voxel);}
        }
      }
    }
  }

}
