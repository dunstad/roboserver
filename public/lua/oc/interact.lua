local component = require('component');
if not component.isAvailable('inventory_controller') then
  error('Inventory controller not found');
end
local inv = component.inventory_controller;
if not component.isAvailable('geolyzer') then
  error('Geolyzer not found');
end
local geolyzer = component.geolyzer;
tcp = require('tcp'); -- if this is local, reloading modules fails in commandLoop
local robot = require('robot');
local adj = require('adjacent');
local pos = require('trackPosition');

local M = {};

function M.sendSlotData(side, slotNum)
  local slot = {
    side = side,
    slotNum = slotNum
  };
  if side == -1 then
    if robot.count(slotNum) > 0 then
      slot.contents = inv.getStackInInternalSlot(slotNum);
    end
  else
    slot.contents = inv.getStackInSlot(side, slotNum);
  end
  tcp.write({['slot data']=slot});
  return slot.contents;
end

function M.sendInventoryData(side)
  local size = M.sendInventoryMetadata(side);
  if size then
    for i = 1, size do
      M.sendSlotData(side, i);
    end
  end
  return size;
end

function M.sendInventoryMetadata(side)
  local inventory = {side = side};
  if side == -1 then
    inventory.size = robot.inventorySize();
    inventory.selected = robot.select();
  else
    inventory.size = inv.getInventorySize(side);
  end
  if inventory.size then
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
  M.sendSlotData(side1, slot1);
  M.sendSlotData(side2, slot2);
  return success;
end

function M.interact(x, y, z, scanType, times)
  local point = {x=x, y=y, z=z};
  local moveSuccess = adj.toAdjacent(point, scanType, times);
  local interactSuccess = false;
  if moveSuccess then
    local pointSide = 3; -- front
    local robotPos = pos.get();
    if point.y > robotPos.y then
      pointSide = 1; -- top
    elseif point.y < robotPos.y then
      pointSide = 0; -- bottom
    end
    interactSuccess = M.sendInventoryData(pointSide);
    if not interactSuccess then
      interactSuccess = component.robot.use(pointSide);
    end
  end
  return moveSuccess and interactSuccess;
end

function M.inspect(x, y, z, scanType, times)
  local point = {x=x, y=y, z=z};
  local moveSuccess = adj.toAdjacent(point, scanType, times);
  local inspectSuccess = false;
  if moveSuccess then
    local pointSide = 3; -- front
    local robotPos = pos.get();
    if point.y > robotPos.y then
      pointSide = 1; -- top
    elseif point.y < robotPos.y then
      pointSide = 0; -- bottom
    end
    inspectSuccess = geolyzer.analyze(pointSide);
    inspectSuccess.point = point;
    tcp.write({['block data']=inspectSuccess});
  end
  local inspectResult = false;
  if moveSuccess and inspectSuccess then
    inspectResult = inspectSuccess.name;
  end
  return inspectResult;
end

return M;