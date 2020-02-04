let validators = require('./fromRobotSchemas.js').validators;
/**
 * An organized way to store map data.
 */
class MapData {

  /**
   * An organized way to store map data.
   */
  constructor() {
    this.map = {};
  }

  /**
   * Retrieve block data from the map if it exists.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {object | false}
   */
  get(x, y, z) {
    let result;
    if (this.map[x] && this.map[x][y] && this.map[x][y][z]) {
      result = this.map[x][y][z];
    }
    else {result = false;}
    return result;
  }

  /**
   * Store block data in or remove it from the map.
   * This will only change properties listed in blockData.
   * If blockData is falsy, it removes the entry.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {object} blockData 
   * @returns {object}
   */
  set(x, y, z, blockData) {
    if (!this.map[x]) {this.map[x] = {};}
    if (!this.map[x][y]) {this.map[x][y] = {};}
    if (blockData) {
      if (!this.map[x][y][z]) {this.map[x][y][z] = {};}
      Object.assign(this.map[x][y][z], blockData);
    }
    else {
      this.map[x][y][z] = undefined;
    }
    return blockData;
  }

  /**
   * Store block data contained in the geolyzer scan format
   * @param {object} geolyzerScan 
   */
  setFromGeolyzerScan(geolyzerScan) {
    validators.geolyzerScan(geolyzerScan);
    for (let x = 0; x < geolyzerScan.w; x++) {
      for (let z = 0; z < geolyzerScan.d; z++) {
        for (let y = 0; y < (geolyzerScan.data.n / (geolyzerScan.w * geolyzerScan.d)); y++) {
  
          let xWithOffset = x + geolyzerScan.x;
          let yWithOffset = y + geolyzerScan.y;
          let zWithOffset = z + geolyzerScan.z;
  
          // this is how the geolyzer reports 3d data in a 1d array
          // also lua is indexed from 1
          let index = (x + 1) + z*geolyzerScan.w + y*geolyzerScan.w*geolyzerScan.d;
          
          this.set(xWithOffset, yWithOffset, zWithOffset, {"hardness": geolyzerScan.data[index]});
  
        }
      }
    }
  }

  /**
   * Store block data contained in the map data format
   * @param {object} mapData 
   */
  setFromMapData(mapData) {
    for (var xIndex in mapData) {
      for (var yIndex in mapData[xIndex]) {
        for (var zIndex in mapData[xIndex][yIndex]) {
          let blockData = mapData[xIndex][yIndex][zIndex];
          this.set(xIndex, yIndex, zIndex, blockData);
        }
      }
    }
  }
  
}
  
try {module.exports = MapData;}
catch(e) {;}