const testData = require('./testData');
const validators = require('../shared/fromRobotSchemas.js');
const assert = require('assert');
const InventoryData = require('../shared/InventoryData');
const runTests = require('./runTests.js');

function setup(testData) {
  let inventory = new InventoryData(testData.internalInventory.meta);
  for (let slot of testData.internalInventory.slots) {
    inventory.setSlot(slot);
  }
  return inventory;
}

let tests = {

  testThing: (inventory)=>{



  },

}

runTests(tests, setup, testData);