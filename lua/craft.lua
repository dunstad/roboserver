local component = require("component");
local robot = component.robot;
local craft = component.crafting.craft;
local inv = component.inventory_controller;
local inet = component.internet;
local string = require("string");
local JSON = require("json");
local table = require("table");

local M = {};

local craftingSlots = {1, 2, 3, nil, 5, 6, 7, nil, 9, 10, 11};

local invSize = robot.inventorySize();

function M.getRecipes(itemName)
  itemName = string.gsub(itemName, " ", "%%20");
  req = inet.request("http://127.0.0.1/recipe/" .. itemName);
  recipeJSON = "";
  reqLine = req.read();
  while reqLine do
    recipeJSON = recipeJSON .. reqLine;
    reqLine = req.read();
  end
	return JSON:decode(recipeJSON);
end

function M.getPattern(patternIndex, recipe)
  local pattern = {false, false, false, false, false, false, false, false, false};
  for slotNum, slotChoices in pairs(recipe["in"]) do
    if #slotChoices >= patternIndex then
      pattern[M.convertSlotToGrid(tonumber(slotNum))] = slotChoices[patternIndex][1].product;
    else
      pattern[M.convertSlotToGrid(tonumber(slotNum))] = slotChoices[1][1].product;
    end
  end
  return pattern;
end

-- determine if we have enough of an item for a recipe
function M.countInPattern(label, pattern)
	local counter = 0;
	for i, name in pairs(pattern) do
		if label == name then
			counter = counter + 1;
		end
	end
	return counter;
end

function M.countInInventory(label)
  local total = 0;
  for i = 1, invSize do
    if robot.count(i) > 0 then
      local slotInfo = inv.getStackInInternalSlot(i);
      if slotInfo.label == label then
        total = total + slotInfo.size;
      end
    end
	end
	return total;
end

function M.firstAvailableSlot()
	for i = 1, invSize do
		if not craftingSlots[i] and not (robot.count(i) > 0) then
			return i;
		end
	end
	-- all slots were full
	return 0;
end

function M.clearCraftingGrid()
  for i, slot in pairs(craftingSlots) do
    if slot then
      if robot.count(slot) > 0 then
        local slotInfo = inv.getStackInInternalSlot(slot);
        robot.select(slot);
        robot.transferTo(M.firstAvailableSlot(slotInfo));
      end
    end
  end
end

-- returns first slot item appears in,
-- not counting the crafting grid.
function M.findItem(label)
	for i = 1, invSize do
    if not craftingSlots[i] and robot.count(i) > 0 then
      local slotInfo = inv.getStackInInternalSlot(i);
      if slotInfo.label == label then
        return i, slotInfo.size;
      end
    end
	end
	return false, 0;
end

-- move one item per call
function M.moveItemToSlot(label, targetSlot, amount)
	local slot = M.findItem(label);
	if slot then
		robot.select(slot);
		return robot.transferTo(targetSlot, amount);
	end
	return false;
end

-- kind of overlaps with craftingSlots
function M.convertGridToSlot(slot)
	if slot > 9 then return 0; end
	local grid = {[1] = 1, [2] = 2, [3] = 3, [4] = 5, [5] = 6, [6] = 7, [7] = 9, [8] = 10, [9] = 11};
	return grid[slot];
end
function M.convertSlotToGrid(slot)
	if slot > 11 then return 0; end
	local grid = {[1] = 1, [2] = 2, [3] = 3, [5] = 4, [6] = 5, [7] = 6, [9] = 7, [10] = 8, [11] = 9};
	return grid[slot];
end

function M.deepCraft(mainLabel)
  local recipes = M.getRecipes(mainLabel);
	-- make sure we have a recipe for this item
	if #recipes == 0 then
		print("No recipes for " .. mainLabel);
		return false;
	end

	-- try the recipes in order
	-- for recipeIndex, recipe in pairs(recipes) do
  local pattern = M.getPattern(1, recipes[1]);

	-- make sure we have all the parts
	for i, partLabel in pairs(pattern) do
    if partLabel then
      local partSlot = M.findItem(partLabel);
      local partQuantity = M.countInInventory(partLabel);
      -- if we don't have one of the required parts
      -- or we don't have enough of one
      if not partSlot or partQuantity < M.countInPattern(partLabel, pattern) then
        -- try to craft it
        if not M.deepCraft(partLabel) then
          -- stop if we can't craft it
          print("Could not craft " .. partLabel);
          return false;
        end
        -- clear the grid after crafting
        M.clearCraftingGrid();
      end
    end
	end

	-- if we made it this far, we have all the items

	-- move the parts to the appropriate slots
	for i, partLabel in pairs(pattern) do
		M.moveItemToSlot(partLabel, M.convertGridToSlot(i), 1);
	end
	if not craft() then
		print("Crafting of " .. mainLabel .. " failed");
		return false;
	end
	print("Crafted " .. mainLabel);
	return true;
end

function M.craft(itemName)
  M.clearCraftingGrid();
  return M.deepCraft(itemName);
end

return M;