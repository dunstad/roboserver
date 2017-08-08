/**
 * Used to simulate an in-game inventory for the test client
 * and to represent the in-game inventory on the web client.
 */
class InventoryData {

  /**
   * Used to set the initial state of a simulated inventory from test data.
   * @param {object} inventoryDataObject 
   */
  constructor(inventoryDataObject) {
    this.size = inventoryDataObject.meta.size;
    this.side = inventoryDataObject.meta.side;
    this.selected = inventoryDataObject.meta.selected;
    this.slots = {};
    for (let slot of inventoryDataObject.slots) {
      this.slots[slot.slotNum] = slot.contents;
    }
  }

}

try {module.exports = InventoryData;}
catch(e) {;}