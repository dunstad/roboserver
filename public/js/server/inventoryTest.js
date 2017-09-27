const testData = require('./testData');
const validators = require('../shared/fromRobotSchemas.js');
const assert = require('assert');
const TestClient = require('../shared/InventoryData');

function setup(testData) {
  let inventory = new InventoryData(testData.internalInventory.meta);
  for (let slot of testData.internalInventory.slots) {
    inventory.setSlot(slot);
  }
  return inventory;
}

let tests = {

  testSerializeMeta: (testClient)=>{

    let inventoryMeta = testClient.serializeMeta();
    validators.inventoryMeta(inventoryMeta);
    
    assert(inventoryMeta.size == testClient.inventory.size);
    assert(inventoryMeta.side == -1);
    assert(inventoryMeta.selected == testClient.inventory.selected);

  },


  testThing: (testClient)=>{



  },

}

for (let testName in tests) {
  tests[testName](setup(testData));
}