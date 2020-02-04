const testData = require('./robotTestData');
const validators = require('../shared/fromRobotSchemas.js').validators;
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

  testSerializeSlot: (inventory)=>{

    for (slotNum in inventory.slots) {
      let slot = inventory.serializeSlot(slotNum);
      validators.inventorySlot(slot);
      assert(slot.side == inventory.side);
      assert(slot.slotNum == slotNum);
      assert.deepEqual(slot.contents, inventory.slots[slotNum]);
    }

  },

}

runTests(tests, setup, testData);