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
   * @returns {object}
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
   * Used to determine whether items can stack.
   * Doesn't take into account remaining space in the stacks.
   * @param {object} itemStack1 
   * @param {object} itemStack2 
   */
  canStack(itemStack1, itemStack2) {
    let sameName = itemStack1.name == itemStack2.name;
    let noDamage = !itemStack1.damage && !itemStack2.damage;
    let noTag = !itemStack1.hasTag && !itemStack2.hasTag;
    let result = false;
    if (sameName && noDamage && noTag) {
      result = true;
    }
    return result;
  }

/**
 * Used to make sure a transfer obeys inventory rules before we execute it.
 * @param {object} fromSlot 
 * @param {object} toSlot 
 * @param {number} desiredTransferAmount
 * @return {number}
 */
  validateTransfer(fromSlot, toSlot, desiredTransferAmount) {
    if (fromSlot.contents) {validators.inventorySlot(fromSlot);}
    if (toSlot.contents) {validators.inventorySlot(toSlot);}

    let finalTransferAmount = 0;
    
    if (!fromSlot.contents || fromSlot.side !== -1 && toSlot.side !== -1) {;}
    else {
      let fromItemStack = fromSlot.contents;
      if (desiredTransferAmount > fromItemStack.size || desiredTransferAmount < 1) {;}
      else if (!toSlot.contents) {
        finalTransferAmount = desiredTransferAmount || fromItemStack.size;
      }
      else {
        let toItemStack = toSlot.contents;
        if (this.canStack(fromItemStack, toItemStack)) {
          var toItemStackSpace = toItemStack.maxSize - toItemStack.size;
          if (toItemStackSpace < 1) {;}
          else {
            let actualTransferAmount;
            if (desiredTransferAmount) {
              actualTransferAmount = Math.min(desiredTransferAmount, toItemStackSpace);
            }
            else {
              actualTransferAmount = Math.min(fromItemStack.size, toItemStackSpace);
            }
            finalTransferAmount = actualTransferAmount;
          }
        }
        else {
          if (!desiredTransferAmount || desiredTransferAmount == fromItemStack.size) {
            finalTransferAmount = fromItemStack.size;
          }
        }
      }
    }
    return finalTransferAmount;
  }

}

try {module.exports = InventoryData;}
catch(e) {;}