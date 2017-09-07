const testData = require('./testData');
const validators = require('../shared/fromRobotSchemas.js');
const assert = require('assert');
const TestClient = require('./TestClient');

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

function setup() {
  return new (TestClient)(testData);
}

let tests = {

  testGeolyzerScan: (testClient)=>{
    let x = -3;
    let z = -3;
    let y = -2;
    let w = 8;
    let d = 8;
    let scan = testClient.geolyzerScan(x, z, y, w, d, 8);
    validators.geolyzerScan(scan);
    
    /**
     * Gets the data index of a particular coordinate in
     * a geolyzer scan.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @return {number}
     */
    function getIndex(x, y, z) {return (x + 1) + z*w + y*w*d;}

    /**
     * Compares scanned hardness values with map hardness values
     *  at the given coordinate to make sure they match.
     * @param {number} mapX 
     * @param {number} mapY 
     * @param {number} mapZ 
     */
    function testCoord(mapX, mapY, mapZ) {
      let scanX = mapX - scan.x;
      let scanY = mapY - scan.y;
      let scanZ = mapZ - scan.z;
      let scanIndex = getIndex(scanX, scanY, scanZ);
      let scanHardness = scan.data[scanIndex];
      let clientMapHardness = testClient.map.get(mapX, mapY, mapZ).hardness || 0;
      assert(scanHardness == clientMapHardness);
    }

    // a coordinate with a block
    testCoord(2, 2, 2);
    // a coordinate without a block
    testCoord(3, 3, 3);
    // the test client's position
    testCoord(4, 4, 4);
  },

  testSerializeMeta: (testClient)=>{

    let inventoryMeta = testClient.serializeMeta();

    assert(inventoryMeta.size == testClient.inventory.size);
    assert(inventoryMeta.side == -1);
    assert(inventoryMeta.selected == testClient.inventory.selected);

  },

  testEquip: (testClient)=>{

    assert(!testClient.equipped);

    let testInventory = testClient.inventory;
    let selectedIndex = testInventory.selected;
    let selectedSlotStack = testInventory.slots[selectedIndex];

    // make sure there's an item in the selected slot
    assert(testInventory.slots[selectedIndex]);

    testClient.equip();

    assert(testClient.equipped == selectedSlotStack);
    assert(!testInventory.slots[selectedIndex]);

  },

  testGetBoxPoints: (testClient)=>{

    let boxPoints = testClient.getBoxPoints(1, 1, 1, 1, 1, 2);

    assert(boxPoints.length == 2);

    assert(boxPoints[0].x == 1);
    assert(boxPoints[0].y == 1);
    assert(boxPoints[0].z == 1);

    assert(boxPoints[1].x == 1);
    assert(boxPoints[1].y == 1);
    assert(boxPoints[1].z == 2);

  },

  testDig: (testClient)=>{

    

  },

  testPlace: (testClient)=>{



  },

  testMove: (testClient)=>{



  },

  testInteract: (testClient)=>{



  },

  testInspect: (testClient)=>{



  },

  testSelect: (testClient)=>{



  },

  testMoveItems: (testClient)=>{



  },

  testGetPosition: (testClient)=>{



  },

  testGetComponents: (testClient)=>{



  },

}

for (let testName in tests) {
  tests[testName](setup());
}