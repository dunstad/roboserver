let testData = require('./testData');
let validators = require('../shared/fromRobotSchemas.js');

/*
testClient.socket = false;

testClient.commandMap.scanArea(1);
testClient.commandMap.viewInventory();
testClient.commandMap.equip();
testClient.commandMap.dig(0, 0, 0, 1, 1, 1, 0, 0);
testClient.commandMap.place(0, 0, 0, 1, 1, 1, 0, 0);
testClient.commandMap.move(2, 2, 2, 1);
testClient.commandMap.interact(1, 1, 1, 1);
testClient.commandMap.inspect(1, 1, 1, 1);
testClient.commandMap.select(2);
testClient.commandMap.transfer(2, -1, 3, -1, 2);
// craft not validated since it's all on the robot
// same for raw
testClient.commandMap.sendPosition();
testClient.commandMap.sendComponents();
*/

/**
 * Used to extract coordinate data from a geolyzer scan.
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @return {number}
 */
function getIndex(x, y, z) {return (x + 1) + z*w + y*w*d;}

function testGeolyzerScan() {
  let testClient = new (require('./testClient'))(testData);
  let x = -3;
  let z = -3;
  let y = -2;
  let w = 8;
  let d = 8;
  let scan = testClient.geolyzerScan(x, z, y, w, d, 8);
  validators.geolyzerScan(scan);

  // scan coordinates are not absolute but map ones are
  // fix this
  function testCoord(x, y, z) {
    let scanHardness = scan.data[getIndex(x, y, z)];
    let testDataHardness = testData.map[x][y][z].hardness;
    assert(scanHardness == testDataHardness);
  }

  // a coordinate with a block
  // a coordinate without a block
  // the test client's position
}

