var commandMap = {
  
  /**
   * Used to view an area around the robot.
   * @param {string} scanLevel
   * @returns {string}
   */
  scanArea: function(scanLevel) {
    scanLevel = parseInt(scanLevel);
    var result = '';
    if (scanLevel == 1) {
      result = 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;';
    }
    else if (scanLevel == 2) {
      result = 'for i=-1,7 do sendScan.plane(i); end return true;';
    }
    return result;
  },

  /**
   * Used to view the contents of the robot's own inventory.
   * @returns {string}
   */
  viewInventory: function() {
    return 'return int.sendInventoryData(-1);';
  },

  /**
   * Used to change the robot's equipped item.
   * @returns {string}
   */
  equip: function() {
    return 'local e = require("component").inventory_controller.equip(); int.sendSlotData(-1, robot.select()); return e;';
  },

  /**
   * Used to dig out blocks in an area.
   * @param {string} v1
   * @param {string} v2
   * @param {string} selectionIndex
   * @param {string} scanLevel
   * @returns {string}
   */
  dig: function(v1, v2, selectionIndex, scanLevel) {
    return 'return dta.digArea(' + [v1, v2, selectionIndex, scanLevel] + ');';
  },

  /**
   * Used to place blocks in an area.
   * @param {string} v1
   * @param {string} v2
   * @param {string} selectionIndex
   * @param {string} scanClose
   * @returns {string}
   */
  place: function(v1, v2, selectionIndex, scanLevel) {
    return 'return dta.placeArea(' + [v1, v2, selectionIndex, scanLevel] + ');';
  },

  /**
   * Used to move to a point.
   * @param {string} x
   * @param {string} y
   * @param {string} z
   * @param {string} scanLevel
   * @returns {string}
   */
  move: function(x, y, z, scanLevel) {
    return 'return mas.to(' + [x, y, z, scanLevel] + ');';
  },

  /**
   * Attempt to right-click whatever is at the coordinates.
   * @param {string} coord
   * @param {string} scanLevel
   * @returns {string}
   */
  interact: function(coord, scanLevel) {
    return 'return int.interact(' + [coord, scanLevel] + ');';
  },

  /**
   * Get more detailed information about whatever is at the coordinates.
   * @param {string} coord
   * @param {string} scanLevel
   * @returns {string}
   */
  inspect: function(coord, scanLevel) {
    return 'return int.inspect(' + [coord, scanLevel] + ');';
  },

  /**
   * Change the selected inventory slot. Relevant for equipping items and placing blocks.
   * @param {string} slotNum
   * @returns {string}
   */
  select: function(slotNum) {
    return 'return robot.select(' + slotNum + ');';
  },

  /**
   * Move items from one slot to another.
   * @param {string} fromSlot
   * @param {string} fromSide
   * @param {string} toSlot
   * @param {string} toSide
   * @param {string} amount
   * @returns {string}
   */
  transfer: function(fromSlot, fromSide, toSlot, toSide, amount) {
    return 'return int.transfer(' + [fromSlot, fromSide, toSlot, toSide, amount] + ');';
  },

  /**
   * Craft an item from parts in the robot's inventory. Uses recipes stored on the server.
   * @param {string} itemName
   * @returns {string}
   */
  craft: function(itemName) {
    return "local c = craft.craft('" + itemName + "'); int.sendInventoryData(-1); return c;";
  },

  /**
   * Run arbitrary Lua code.
   * @param {string} commandString
   * @returns {string}
   */
  raw: function(commandString) {
    return commandString;
  },

};

/**
 * Converts a command received from the web client to the Lua
 * code which will be run on the robot.
 * @param {string} commandName 
 * @param {any[]} parameters 
 * @returns {string}
 */
function getCommandString(commandName, parameters) {
  var result = "";
  var paramStrings = parameters ? parameters.map(s=>typeof s == 'string' ? s : JSON.stringify(s)) : [];
  console.log(paramStrings)
  if (commandMap[commandName]) {
    result = commandMap[commandName].apply(this, paramStrings);
  }
  return result;
}

module.exports = getCommandString;