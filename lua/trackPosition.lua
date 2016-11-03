local robot = require("robot");
local tcp = require('tcp');
local orient = require('trackOrientation');

-- wherever you start using these functions is considered 0, 0, 0
-- don't stop using them once you start or they won't be accurate
local position = {x=0, y=0, z=0};

local M = {};

function M.set(x, y, z)
  position = {x=x, y=y, z=z};
  return position;
end

function M.get()
  return position;
end

-- how to change coordinates based on orientation
-- 0: z+, south
-- 1: x+, east
-- 2: z-, north
-- 3: x-, west
local forwardMap = {
  [0]={z=1},
  [1]={x=1},
  [2]={z=-1},
  [3]={x=-1}
};

local backwardMap = {
  [0]={z=-1},
  [1]={x=-1},
  [2]={z=1},
  [3]={x=1}
};

-- orientation comes from trackOrientation.lua
function M.forward()
  -- the loop will only perform one iteration
  -- this is just a way to treat the properties generically
  if (robot.forward()) then
    for axis, change in pairs(forwardMap[orient.get()]) do
      position[axis] = position[axis] + change;
    end
    sendLocation();
    return position;
  end
  -- if the movement failed
  return false;
end

function M.back()
  if (robot.back()) then
    for axis, change in pairs(backwardMap[orient.get()]) do
      position[axis] = position[axis] + change;
    end
    sendLocation();
    return position;
  end
  return false;
end

function M.up()
  if (robot.up()) then
    position.y = position.y + 1;
    sendLocation();
    return position;
  end
  return false;
end

function M.down()
  if (robot.down()) then
    position.y = position.y - 1;
    sendLocation();
    return position;
  end
  return false;
end

local function sendLocation()
  return tcp.write({['robot position']=position});
end

return M;
