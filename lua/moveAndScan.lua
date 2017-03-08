local scan = require('scanDirection');
local orient = require('trackOrientation');
local pos = require('trackPosition');

local position = pos.get();

local M = {};

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
  ["forward"] = function(times) return scan.forwardBig(0, times); end,
  ["back"] = function(times) return scan.backBig(0, times); end,
  ["up"] = doNothing,
  ["down"] = doNothing
};

local scanTypeMap = {
  [0] = directionToNoScanMap,
  [1] = directionToScanSmallMap,
  [2] = directionToScanBigMap
};

local directionToMoveFunctionMap = {
  ["forward"] = pos.forward,
  ["back"] = pos.back,
  ["up"] = pos.up,
  ["down"] = pos.down
};

function M.moveAndScan(direction, scanType, times)
  local p = directionToMoveFunctionMap[direction]();
  scanTypeMap[scanType][direction](times);
  return p;
end

-- try to reach the desired X or Z coordinate until it fails
function M.approach(target, current, faceAxis)
  if target ~= current then
    local dist = target - current;
    faceAxis(dist);
    for i = 1, math.abs(dist) do
      if not pos.forward() then return false; end
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
      toward = pos.up;
    else
      toward = pos.down;
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
