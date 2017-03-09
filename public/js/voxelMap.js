class voxelMap {
  constructor() {
    this.map = {};
  }

  get(x, y, z) {
    var result = undefined;
    if (this.map[x] && this.map[x][y] && this.map[x][y][z]) {
      result = this.map[x][y][z];
    }
    else {result = false;}
    return result;
  }

  set(x, y, z, voxel) {
    if (!this.map[x]) {this.map[x] = {};}
    if (!this.map[x][y]) {this.map[x][y] = {};}
    this.map[x][y][z] = voxel;
    return voxel;
  }

}
