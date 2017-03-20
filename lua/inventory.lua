local component = require('component');
if not component.isAvailable('inventory_controller') then
  error('Inventory controller not found');
end
local inv = component.inventory_controller;
local tcp = require('tcp');
local robot = require('robot');
local adj = require('adjacent');
local pos = require('trackPosition');

local M = {};

function M.sendInventoryData(side)
  local inventory = {
    side = side,
    contents = {}
  };
  if side == -1 then
    inventory.size = robot.inventorySize();
    inventory.selected = robot.select();
  else
    inventory.size = inv.getInventorySize(side);
  end
  if inventory.size then
    for i = 1, inventory.size do
      if (side == -1) then
        if robot.count(i) > 0 then
          inventory.contents[i] = inv.getStackInInternalSlot(i);
        end
      else
        inventory.contents[i] = inv.getStackInSlot(side, i);
      end
    end
    tcp.write({['inventory data']=inventory});
  end
  return inventory.size;
end

function M.transfer(slot1, side1, slot2, side2, amount)
  local originalSlot = robot.select();
  local success = false;
  if (side1 == -1 and side2 == -1) then
    robot.select(slot1);
    success = robot.transferTo(slot2, amount);
  elseif (side1 == -1) then
    robot.select(slot1);
    success = inv.dropIntoSlot(side2, slot2, amount);
  elseif (side2 == -1) then
    robot.select(slot2);
    success = inv.suckFromSlot(side1, slot1, amount);
  else
    error('Cannot transfer from one external inventory to another');
  end
  robot.select(originalSlot);
  return success;
end

function M.openInventory(point, scanType, times)
  local moveSuccess = adj.toAdjacent(point, scanType, times);
  local sendSuccess = false;
  if moveSuccess then
    local inventorySide = 3; -- front
    local robotPos = pos.get();
    if point.y > robotPos.y then
      inventorySide = 1; -- top
    elseif point.y < robotPos.y then
      inventorySide = 0; -- bottom
    end
    sendSuccess = M.sendInventoryData(inventorySide);
  end
  return moveSuccess and sendSuccess;
end

return M;