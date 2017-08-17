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

  /**
	 * Used to format slot data in a way the server understands.
	 * @param {number} slotNum 
	 */
	serializeSlot(slotNum) {
		let inventorySlot = {
			side: this.side,
			slotNum: slotNum,
			contents: this.slots[slotNum],
		};
		return inventorySlot;
	}

/**
 * Used to make sure a transfer obeys inventory rules before we execute it.
 * @param {object} fromSlot 
 * @param {object} toSlot 
 * @param {number} desiredTransferAmount 
 */
  validateTransfer(fromSlot, toSlot, desiredTransferAmount) {
    if (fromSlot.contents) {validators.inventorySlot(fromSlot);}
    if (toSlot.contents) {validators.inventorySlot(toSlot);}

    let success = false;
    
    if (!fromSlot.contents || fromSlot.side !== -1 && toSlot.side !== -1) {;}
    else {
      console.log("a")
      let fromItemStack = fromSlot.contents;
      if (desiredTransferAmount > fromItemStack.size || desiredTransferAmount < 1) {;}
      else if (!toSlot.contents) {
        console.log("b")
        // transferAndUpdate(fromSlot, toSlot, desiredTransferAmount || fromItemStack.size);
        success = true;
      }
      else {
        console.log("c")
        let toItemStack = toSlot.contents;
        if (fromItemStack.name == toItemStack.name &&
          !fromItemStack.damage && !toItemStack.damage &&
          !fromItemStack.hasTag && !toItemStack.hasTag) {
          console.log("d")
          var toItemStackSpace = toItemStack.maxSize - toItemStack.size;
          if (toItemStackSpace < 1) {;}
          else {
            if (desiredTransferAmount) {
              console.log("e")
              let actualTransferAmount = Math.min(desiredTransferAmount, toItemStackSpace);
            }
            else {
              console.log("f")
              let actualTransferAmount = Math.min(fromItemStack.size, toItemStackSpace);
            }
            console.log("g")
            // transferAndUpdate(fromSlot, toSlot, actualTransferAmount);
            success = true;
          }
        }
        else {
          console.log("h")
          if (!desiredTransferAmount) {
            console.log("i")
            // swapCells(fromSlot, toSlot);
          }
        }
      }
    }
    console.log("j")
    return success;
  }

}

try {module.exports = InventoryData;}
catch(e) {;}