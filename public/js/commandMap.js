var commandMap = {
  
  scanArea: function() {
    return 'for i=-1,7 do sendScan.plane(i); end return true;';
  },

  scanClose: function() {
    return 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;';
  },

  viewInventory: function() {
    return 'return int.sendInventoryData(-1);';
  },

  equip: function() {
    return 'local e = require("component").inventory_controller.equip(); int.sendInventoryData(-1); return e;';
  },

  dig: function(v1, v2, selectionIndex, scanLevel) {
    return 'return dta.digArea(' + [v1, v2, selectionIndex, scanLevel] + ');';
  },

  place: function(v1, v2, selectionIndex, scanClose) {
    return 'return dta.placeArea(' + [v1, v2, selectionIndex, scanLevel] + ');';
  },

  move: function(x, y, z, scanLevel) {
    return 'return mas.to(' + [x, y, z, scanLevel] + ');';
  },

  interact: function(coord, scanLevel) {
    return 'return int.interact(' + [coord, scanLevel] + ');';
  },

  inspect: function(coord, scanLevel) {
    return 'return int.inspect(' + [coord, scanLevel] + ');';
  },

  select: function(slotNum) {
    return 'return robot.select(' + slotNum + ');';
  },

  transfer: function(fromSlot, fromSide, toSlot, toSide, amount) {
    return 'return int.transfer(' + [fromSlot, fromSide, toSlot, toSide, amount] + ');';
  },

  craft: function(itemName) {
    return "local c = craft.craft('" + itemName + "'); int.sendInventoryData(-1); return c;";
  },

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
  if (commandMap[commandName]) {
    result = commandMap[commandName].apply(this, parameters.map(JSON.stringify));
  }
  return result;
}

module.exports = getCommandString;