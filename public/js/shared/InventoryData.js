let validators = require('./fromRobotSchemas.js');
/**
 * Used to simulate an in-game inventory for the test client
 * and to represent the in-game inventory on the web client.
 */
class InventoryData {

  /**
   * Used to set the initial state of a simulated inventory from test data.
   * @param {object} inventoryMeta 
   */
  constructor(inventoryMeta) {
    validators.inventoryMeta(inventoryMeta);
    this.size = inventoryMeta.size;
    this.side = inventoryMeta.side;
    this.selected = inventoryMeta.selected;
    this.slots = {};
  }

  /**
   * Used to change the contents of a slot in the inventory.
   * @param {object} inventorySlot 
   */
  setSlot(inventorySlot) {
    validators.inventorySlot(inventorySlot);
    this.slots[inventorySlot.slotNum] = inventorySlot.contents;
  }

}

try {module.exports = InventoryData;}
catch(e) {;}