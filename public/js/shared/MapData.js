let validators = require('./fromRobotSchemas.js');
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
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {object} blockData 
   * @returns {object}
   */
  set(x, y, z, blockData) {
    if (!this.map[x]) {this.map[x] = {};}
    if (!this.map[x][y]) {this.map[x][y] = {};}
    this.map[x][y][z] = blockData;
    return blockData;
  }

  /**
   * Store block data contained in the geolyzer scan format
   * @param {object} geolyzerScan 
   */
  setFromGeolyzerScan(geolyzerScan) {
    validators.geolyzerScan(geolyzerScan);
    
  }

}
  
try {module.exports = InventoryData;}
catch(e) {;}