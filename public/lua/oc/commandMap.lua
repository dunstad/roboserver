local sendScan = require('sendScan');
local int = require('interact');
local component = require('component');
local inv = component.inventory_controller;
local robot = require('robot');
local dta = require('doToArea');
local mas = require('moveAndScan');
local craft = require('craft');
local pos = require('trackPosition');

tcp = require('tcp'); -- if this is local, reloading modules fails in commandLoop
local config = require('config');
local raw = config.get(config.path).components.raw;
local rawBool = (raw == "true" or raw == true) and true or false;

local M = {};

M['scanArea'] = function(scanLevel)
  local result;
  if scanLevel == 1 then
    for i=-2,5 do
      result = sendScan.volume(-3, -3, i, 8, 8, 1)
    end
  elseif scanLevel == 2 then
    for i=-1,7 do
      result = sendScan.plane(i);
    end
  end
  return result;
end;

M['viewInventory'] = function()
  return int.sendInventoryData(-1);
end;

M['equip'] = function()
  inv.equip();
  int.sendInventoryMetadata(-1);
  return int.sendSlotData(-1, robot.select());
end;

M['dig'] = function(x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel)
  return dta.digArea(x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel);
end;

M['place'] = function(x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel)
  return dta.placeArea(x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel);
end;

M['move'] = function(x, y, z, selectionIndex, scanLevel)
  return mas.to(x, y, z, selectionIndex, scanLevel);
end;

M['interact'] = function(x, y, z, scanLevel)
  return int.interact(x, y, z, scanLevel);
end;

M['inspect'] = function(x, y, z, scanLevel)
  return int.inspect(x, y, z, scanLevel);
end;

M['select'] = function(slotNum)
  return robot.select(slotNum);
end;

M['transfer'] = function(fromSlot, fromSide, toSlot, toSide, amount)
  return int.transfer(fromSlot, fromSide, toSlot, toSide, amount);
end;

M['craft'] = function(itemName)
  return craft.craft(itemName);
end;

M['raw'] = function(commandString)
  local command = load(commandString, nil, 't', _ENV);
  local status, result = pcall(command);
  return status, result;
end;

M['sendPosition'] = function()
  return pos.sendLocation();
end;

M['sendComponents'] = function()
  return tcp.write({['raw']=rawBool});
end;

M['message'] = function(message)
  return print(message);
end;

return M;