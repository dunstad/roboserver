local robot = require("robot");
local tcp = require('tcp');
local orient = require('trackOrientation');
local scan = require("scanDirection");

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


function M.sendLocation()
  return tcp.write({['robot position']=position});
end

-- orientation comes from trackOrientation.lua
function M.forward()
  -- the loop will only perform one iteration
  -- this is just a way to treat the properties generically
  if (robot.forward()) then
    for axis, change in pairs(forwardMap[orient.get()]) do
      position[axis] = position[axis] + change;
    end
    M.sendLocation();
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
    M.sendLocation();
    return position;
  end
  return false;
end

function M.up()
  if (robot.up()) then
    position.y = position.y + 1;
    M.sendLocation();
    return position;
  end
  return false;
end

function M.down()
  if (robot.down()) then
    position.y = position.y - 1;
    M.sendLocation();
    return position;
  end
  return false;
end

function doNothing() end

local directionToNoScanMap = {
  ["forward"] = doNothing,
  ["back"] = doNothing,
  ["up"] = doNothing,
  ["down"] = doNothing
};

local directionToScanSmallMap = {
  ["forward"] = scan.forwardSmall,
  ["back"] = scan.backSmall,
  ["up"] = doNothing,
  ["down"] = doNothing
};

local directionToScanBigMap = {
  ["forward"] = scan.forwardBig,
  ["back"] = scan.backBig,
  ["up"] = doNothing,
  ["down"] = doNothing
};

local scanTypeMap = {
  [0] = directionToNoScanMap,
  [1] = directionToScanSmallMap,
  [2] = directionToScanBigMap
};

local directionToMoveFunctionMap = {
  ["forward"] = M.forward,
  ["back"] = M.back,
  ["up"] = M.up,
  ["down"] = M.down
};

function M.moveAndScan(direction, scanType)
  local p = directionToMoveFunctionMap[direction]();
  scanTypeMap[scanType][direction]();
  return p;
end

-- try to reach the desired X or Z coordinate until it fails
function M.approach(target, current, faceAxis)
  if target ~= current then
    local dist = target - current;
    faceAxis(dist);
    for i = 1, math.abs(dist) do
      if not M.forward() then return false; end
    end
  end
  return true;
end

-- try to reach the desired Y coordinate until it fails
function M.approachY(target)
  if target ~= position.y then

    local dist = target - position.y;

    local toward;
    if dist > 0 then
      toward = M.up;
    else
      toward = M.down;
    end

    for i = 1, math.abs(dist) do
      if not toward() then return false; end
    end

  end
  return true;
end

-- attempt to go to coordinate until we get stuck
function M.to(x, y, z)
  local start = {
    x = position.x,
    y = position.y,
    z = position.z,
  };
  local xReached = M.approach(x, position.x, orient.faceX);
  local zReached = M.approach(z, position.z, orient.faceZ);
  local yReached = M.approachY(y);
  if xReached and zReached and yReached then
    return true;
  elseif
    start.x == position.x and
    start.y == position.y and
    start.z == position.z then
    return false;
  else
    return M.to(x, y, z);
  end
end

return M;
