local component = require('component');
if not component.isAvailable('inventory_controller') then
  error('Inventory controller not found');
end
local inv = component.inventory_controller;
local tcp = require('tcp');
local robot = require('robot');

local M = {};

function M.sendInventoryData()
  local inventory = {
    size = robot.inventorySize(),
    side = -1,
    selected = robot.select();
    contents = {}
  };
  for i = 1, robot.inventorySize() do
    inventory.contents[i] = inv.getStackInInternalSlot(i);
  end
  tcp.write({['inventory data']=inventory});
end

function M.swap(slot1, slot2)
  local originalSlot = robot.select();
  robot.select(slot1);
  local success = robot.transferTo(slot2);
  robot.select(originalSlot);
  return success;
end

function M.transfer(slot1, slot2, amount)
  local originalSlot = robot.select();
  robot.select(slot1);
  local success = robot.transferTo(slot2, amount);
  robot.select(originalSlot);
  return success;
end

return M;