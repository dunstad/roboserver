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

local M = {};

M['scanArea'] = function(scanLevel, times)
  local result;
  if scanLevel == 1 then
    for i=-2,5 do
      result = sendScan.volume(-3, -3, i, 8, 8, 1, times)
    end
  elseif scanLevel == 2 then
    for i=-1,7 do
      result = sendScan.plane(i, times);
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

M['dig'] = function(x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex)
  return dta.digArea(x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex);
end;

M['place'] = function(x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex)
  return dta.placeArea(x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex);
end;

M['move'] = function(x, y, z, relative, scanLevel)
  return mas.to(x, y, z, relative, scanLevel);
end;

M['interact'] = function(x, y, z, relative, scanLevel)
  return int.interact(x, y, z, relative, scanLevel);
end;

M['inspect'] = function(x, y, z, relative, scanLevel)
  return int.inspect(x, y, z, relative, scanLevel);
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

function runInTerminal(commandText)
  local file = assert(io.popen(commandText, 'r'));
  local output = file:read('*all');
  file:close();
  return output;
end

M['raw'] = function(commandString)
  local raw = config.get(config.path).raw;
  local rawBool = (raw == "true" or raw == true) and true or false;
  local result;
  if rawBool then
    local status;
    local command = load(commandString, nil, 't', _ENV);
    status, result = pcall(command);
  else
    result = false;
  end
  return result;
end;

M['sendPosition'] = function()
  return pos.sendLocation();
end;

M['sendComponents'] = function()
  return tcp.write({['available components']=component.list()});
end;

M['config'] = function(optionName, optionValue)
  local result;
  if optionName and (optionValue ~= nil) then
    config.set({[optionName]=optionValue}, config.path);
    result = true;
  elseif optionName then
    local options = {};
    options[optionName] = config.get(config.path)[optionName];
    result = tcp.write({['config']=options});
  else
    result = tcp.write({['config']=config.get(config.path)});
  end
  return result;
end;

M['message'] = function(message)
  return print(message);
end;

return M;