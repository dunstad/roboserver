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
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {object | boolean}
   */
  get(x, y, z) {
    var result = undefined;
    if (this.map[x] && this.map[x][y] && this.map[x][y][z]) {
      result = this.map[x][y][z];
    }
    else {result = false;}
    return result;
  }

  /**
   * Store a voxel in the map or remove one from it.
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @param {object} voxel 
   * @returns {object}
   */
  set(x, y, z, voxel) {
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
          func(this.map[xIndex][yIndex][zIndex]);
        }
      }
    }
  }

}
