const testData = require('./robotTestData');
const validators = require('../shared/fromRobotSchemas.js');
const assert = require('assert');
const TestClient = require('./TestClient');
const runTests = require('./runTests.js');

function setup(testData) {
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
    validators.inventoryMeta(inventoryMeta);
    
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

    assert.deepEqual(testClient.equipped, selectedSlotStack);
    assert(!testInventory.slots[selectedIndex]);

  },

  testGetBoxPoints: (testClient)=>{

    let boxPoints = testClient.getBoxPoints(1, 1, 1, 1, 1, 2);
    for (point of boxPoints) {validators.digSuccess(point);}

    assert(boxPoints.length == 2);

    assert(boxPoints[0].x == 1);
    assert(boxPoints[0].y == 1);
    assert(boxPoints[0].z == 1);

    assert(boxPoints[1].x == 1);
    assert(boxPoints[1].y == 1);
    assert(boxPoints[1].z == 2);

  },

  testDig: (testClient)=>{

    assert(testClient.map.get(2, 2, 2));
    testClient.dig(2, 2, 2)
    assert(!testClient.map.get(2, 2, 2));

  },

  testPlace: (testClient)=>{



  },

  testMove: (testClient)=>{

    let pos = testClient.position;
    
    assert(pos.x == 4);
    assert(pos.y == 4);
    assert(pos.z == 4);
    assert(testClient.map.get(4, 4, 4).hardness == 2);
    assert(!testClient.map.get(3, 3, 3).hardness);
    
    testClient.move(3, 3, 3);
    let newPos = testClient.position;
    validators.position(newPos);
    
    assert(newPos.x == 3);
    assert(newPos.y == 3);
    assert(newPos.z == 3);
    assert(testClient.map.get(3, 3, 3).hardness == 2);
    assert(!testClient.map.get(4, 4, 4).hardness);

  },

  testInteract: (testClient)=>{



  },

  testInspect: (testClient)=>{



  },

  testSelect: (testClient)=>{

    assert(testClient.inventory.selected != 4);
    testClient.select(4);
    assert(testClient.inventory.selected == 4);

  },

  testMoveItems: (testClient)=>{

    let inv = testClient.inventory;
    let slots = inv.slots;

    // move item to an empty slot
    assert(slots[7].label == 'Wooden Sword?');
    assert(!slots[6]);
    testClient.moveItems(inv, 7, inv, 6, 1);
    assert(slots[6].label == 'Wooden Sword?');
    assert(!slots[7]);
    
    // combine item stacks
    assert(slots[1].size == 64);
    assert(slots[2].size == 37);
    testClient.moveItems(inv, 1, inv, 2, 1);
    assert(slots[1].size == 63);
    assert(slots[2].size == 38);

    // split item stack
    assert(slots[1].size == 63);
    assert(!slots[3]);
    testClient.moveItems(inv, 1, inv, 3, 1);
    assert(slots[1].size == 62);
    assert(slots[3].size == 1);
    
    // swap different item stacks
    assert(slots[6].label == 'Wooden Sword?');
    assert(slots[5].label == 'Stone');
    testClient.moveItems(inv, 6, inv, 5, 1);
    assert(slots[6].label == 'Stone');
    assert(slots[5].label == 'Wooden Sword?');

    // fail to combine different item stacks
    assert(slots[6].label == 'Stone');
    assert(slots[6].size == 3);
    assert(slots[5].label == 'Wooden Sword?');
    let combineDifferent = testClient.moveItems(inv, 6, inv, 5, 1);
    assert(!combineDifferent);

  },

  testGetPosition: (testClient)=>{

    let pos = testClient.getPosition();
    validators.position(pos);
    assert.deepEqual(pos, testClient.position);

  },

  testGetComponents: (testClient)=>{

    let components = testClient.getComponents();
    validators.components(components);
    assert.deepEqual(components, testClient.components);

  },

  testGetID: (testClient)=>{

    let id = testClient.getID();
    validators.id(id);

  },

  testDecreasePower: (testClient)=>{

    let startingPower = testClient.power;
    let lowerPower = testClient.decreasePower();
    validators.powerLevel(lowerPower);
    assert(startingPower > lowerPower);

  },

  testPlace: (testClient)=>{

    assert(testClient.map.get(2, 2, 2));
    assert(!testClient.place(2, 2, 2));
    
    assert(!testClient.map.get(3, 3, 3));
    let testBlockData = {
      name: 'minecraft:dirt',
      hardness: .5,
      point: {
        x: 3,
        y: 3,
        z: 3,
      },
    }
    assert.deepEqual(testClient.place(3, 3, 3), testBlockData);
    
  },

  testInspect: (testClient)=>{

    assert(!testClient.map.get(3, 3, 3));
    let airBlockData = {
      name: 'minecraft:air',
      hardness: 0,
      point: {
        x: 3,
        y: 3,
        z: 3,
      },
    }
    assert.deepEqual(testClient.inspect(3, 3, 3), airBlockData);
    
    assert(testClient.map.get(2, 2, 2));
    let testBlockData = {
      name: 'minecraft:dirt',
      hardness: .5,
      point: {
        x: 2,
        y: 2,
        z: 2,
      },
    }
    assert.deepEqual(testClient.inspect(2, 2, 2), testBlockData);

  },

}

runTests(tests, setup, testData);