local component = require('component');
if not component.isAvailable("inventory_controller") then
  error("Inventory controller not found");
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
    contents[i] = getStackInInternalSlot(i);
  end
  tcp.write({['inventory data']=inventory});
end

return M;