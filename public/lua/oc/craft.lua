local component = require("component");
local robot = component.robot;
local craft = component.crafting.craft;
local inv = component.inventory_controller;
local inet = component.internet;
local string = require("string");
local JSON = require("json");
local table = require("table");
local config = require('config');
local conf = config.get(config.path);
local int = require('interact');

local M = {};

local craftingSlots = {1, 2, 3, nil, 5, 6, 7, nil, 9, 10, 11};

local invSize = robot.inventorySize();

function M.getRecipes(itemName)
  itemName = string.gsub(itemName, " ", "%%20");
  itemName = string.gsub(itemName, "/", "%%2F");
  local req = inet.request("http://" .. conf.serverIP .. ':' .. conf.serverPort .. "/recipe/" .. itemName);
  local recipeJSON = "";
  local reqLine = req.read();
  while reqLine do
    recipeJSON = recipeJSON .. reqLine;
    reqLine = req.read();
  end
  req.close();
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

function M.getRecipeChoiceCount(recipe)
  local recipeChoiceCount = 0;
  for slotNum, slotChoices in pairs(recipe["in"]) do
    if #slotChoices > recipeChoiceCount then
      recipeChoiceCount = #slotChoices;
    end
  end
  return recipeChoiceCount;
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

function M.firstAvailableSlot(stackInfo)
  local availableSlot = 0;
	for i = 1, invSize do
    if availableSlot == 0 then
      if not craftingSlots[i] then
        if not (robot.count(i) > 0)  then
          availableSlot = i;
        else
          if stackInfo then
            local slotInfo = inv.getStackInInternalSlot(i);
            local sameName = stackInfo.label == slotInfo.label;
            local stackFits = stackInfo.size + slotInfo.size <= slotInfo.maxSize;
            if sameName and stackFits then
              availableSlot = i;
            end
          end
        end
      end
    end
	end
	return availableSlot;
end

function M.clearCraftingGrid()
  local side = -1;
  int.sendInventoryMetadata(side);
  for i, slot in pairs(craftingSlots) do
    if slot then
      if robot.count(slot) > 0 then
        local slotInfo = inv.getStackInInternalSlot(slot);
        robot.select(slot);
        local firstSlot = M.firstAvailableSlot(slotInfo);
        robot.transferTo(firstSlot);
        int.sendSlotData(side, firstSlot);
      end
      int.sendSlotData(side, slot);
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
    local side = -1;
		local result = robot.transferTo(targetSlot, amount);
    int.sendInventoryMetadata(side);
    int.sendSlotData(side, slot);
    int.sendSlotData(side, targetSlot);
    return result;
	end
	return false;
end

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

function M.deepCraft(mainLabel, previousLabels)

  -- don't get stuck in recipe loops
  if previousLabels[mainLabel] then
    print("Already attempted to craft " .. mainLabel);
		return false;
  end
  previousLabels[mainLabel] = true;

  local recipes = M.getRecipes(mainLabel);

  -- make sure we have a recipe for this item
	if #recipes == 0 then
		print("No recipes for " .. mainLabel);
		return false;
	end


  local pattern;
  local allPartsCraftSuccess = false;
  for recipeIndex = 1, #recipes do
    if not allPartsCraftSuccess then
      local recipeChoiceCount = M.getRecipeChoiceCount(recipes[recipeIndex]);
      for recipeChoice = 1, recipeChoiceCount do
        -- if no previous attempt has succeeded
        if not allPartsCraftSuccess then
          pattern = M.getPattern(recipeChoice, recipes[recipeIndex]);
          local partCraftSuccess = true;
          for i, partLabel in pairs(pattern) do
            -- if all parts have been successfully crafted so far
            if partCraftSuccess then
              if partLabel then
                
                while not M.enough(partLabel, pattern) and partCraftSuccess  do
                  partCraftSuccess = M.deepCraft(partLabel, copyTable(previousLabels));
                end

              end
            end
          end
          if partCraftSuccess then
            allPartsCraftSuccess = true;
          end
        end
      end
    end
  end

  local patternCraftSuccess = false;
  if allPartsCraftSuccess then
    patternCraftSuccess = M.craftPattern(pattern, mainLabel);
    if not patternCraftSuccess then
      print("Failed to craft " .. mainLabel);
    else
      print("Crafted " .. mainLabel);
    end
  else
    print("Not all parts successfully crafted");
  end

  return patternCraftSuccess;

end

function M.craftPattern(pattern, mainLabel)
  local craftSuccess;

  if M.allPatternPartsPresent(pattern) then
    -- move the parts to the appropriate slots
    for i, partLabel in pairs(pattern) do
      M.moveItemToSlot(partLabel, M.convertGridToSlot(i), 1);
    end
    robot.select(1);
    craftSuccess = craft(1);
    M.clearCraftingGrid();
  else
    -- iterate again to make sure we get all the parts
    -- not super elegant but easy to write
    craftSuccess = M.craft(mainLabel);
  end

  return craftSuccess;
end

function M.craft(itemName)
  M.clearCraftingGrid();
  local result = M.deepCraft(itemName, {});
  local side = -1;
  int.sendInventoryMetadata(side);
  for k, slotNum in pairs(craftingSlots) do
    if slotNum then
      int.sendSlotData(side, slotNum);
    end
  end
  return result;
end

function M.enough(partLabel, pattern)
  return M.countInInventory(partLabel) >= M.countInPattern(partLabel, pattern);
end

function M.allPatternPartsPresent(pattern)
  local allPartsPresent = true;

  for i, partLabel in pairs(pattern) do
    if partLabel then
      if not allPartsPresent or not M.enough(partLabel, pattern) then
        allPartsPresent = false;
      end
    end
  end

  return allPartsPresent;
end

function copyTable(table1)
  local table2 = {};
  for key, value in pairs(table1) do
    table2[key] = value;
  end
  return table2;
end

return M;