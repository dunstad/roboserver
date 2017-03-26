local component = require("component");
local robot = component.robot;
local craft = component.crafting.craft;
local inv = component.inventory_controller;
local inet = component.internet;
local string = require("string");

function getRecipes(itemName)
  itemName = string.gsub(itemName, " ", "%%20");
  req = inet.request("http://127.0.0.1/recipe/" .. itemName);
  recipeJSON = "";
  reqLine = req.read();
  while reqLine do
    recipeJSON = recipeJSON .. reqLine;
    reqLine = req.read();
  end
  return recipeJSON;
end

local craftingSlots = {1, 2, 3, nil, 5, 6, 7, nil, 9, 10, 11}

local recipes = dofile("recipes.lua")

local invSize = robot.inventorySize();

function firstAvailableSlot()
	for i = 1, invSize do
		if not craftingSlots[i] and
			 not inv.getStackInInternalSlot(i) then
			return i
		end
	end
	-- all slots were full
	return 0
end

function clearCraftingGrid()
  for i, slot in pairs(craftingSlots) do
    if slot then
      local slotInfo = inv.getStackInInternalSlot(slot)
      if slotInfo then
        robot.select(slot)
        robot.transferTo(firstAvailableSlot(slotInfo))
      end
    end
  end
end

-- returns first slot item appears in,
-- not counting the crafting grid.
function findItem(label)
	for i = 1, invSize do
		local slotInfo = inv.getStackInInternalSlot(i)
		if slotInfo and slotInfo.label == label
			 and not craftingSlots[i] then
			return i, slotInfo.size
		end
	end
	return false
end

-- move one item per call
function moveItemToSlot(label, targetSlot)
	slot = findItem(label)
	if slot then
		robot.select(slot)
		return robot.transferTo(targetSlot, 1)
	end
	return false
end

-- kind of overlaps with craftingSlots
function convertGridToSlot(slot)
	if slot > 9 then return 0 end
	local grid = {[1] = 1, [2] = 2, [3] = 3, [4] = 5, [5] = 6, [6] = 7, [7] = 9, [8] = 10, [9] = 11}
	return grid[slot]
end

-- determine if we have enough of an item for a recipe
function countInPattern(label, pattern)
	local counter = 0
	for i, name in pairs(pattern) do
		if label == name then
			counter = counter + 1
		end
	end
	return counter
end

function deepCraft(mainLabel)
  local recipes = getRecipes(mainLabel);
	-- make sure we have a recipe for this item
	if #recipes[mainLabel] == 0 then
		print("No recipe for " .. mainLabel)
		return false
	end -- continue here
	-- make sure we have all the parts
	for i, partLabel in pairs(recipes[mainLabel]) do
		partSlot, partQuantity = findItem(partLabel)
		-- if we don't have one of the required parts
		-- or we don't have enough of one
		if not partSlot or
			 partQuantity < countInPattern(partLabel, recipes[mainLabel]) then
			-- try to craft it
			if not deepCraft(partLabel) then
				-- stop if we can't craft it
				print("Could not craft")
				return false
			end
		end
	end

	-- if we made it this far, we have all the items

	clearCraftingGrid()
	-- move the parts to the appropriate slots
	for i, partLabel in pairs(recipes[mainLabel]) do
		moveItemToSlot(partLabel, convertGridToSlot(i))
	end
	if not craft() then
		print("Crafting of " .. mainLabel .. " failed")
		return false
	end
	print("Crafted " .. mainLabel)
	return true
end