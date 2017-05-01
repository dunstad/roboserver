local scan = require('scanDirection');
local orient = require('trackOrientation');
local pos = require('trackPosition');
local robot = require('robot');

local position = pos.get();

local M = {};

function doNothing() end

local directionToNoScanMap = {
  ["forward"] = doNothing,
  ["back"] = doNothing,
  ["up"] = doNothing,
  ["down"] = doNothing,
};

local directionToScanSmallMap = {
  ["forward"] = scan.forwardSmall,
  ["back"] = scan.backSmall,
  ["up"] = scan.upSmall,
  ["down"] = scan.downSmall,
};

local directionToScanBigMap = {
  ["forward"] = function(times) for i=-1,7 do scan.forwardBig(0, times); end end,
  ["back"] = function(times) for i=-1,7 do scan.backBig(0, times); end end,
  ["up"] = scan.upBig,
  ["down"] = scan.downBig,
};

local scanTypeMap = {
  [0] = directionToNoScanMap,
  [1] = directionToScanSmallMap,
  [2] = directionToScanBigMap,
};

local directionToMoveFunctionMap = {
  ["forward"] = pos.forward,
  ["back"] = pos.back,
  ["up"] = pos.up,
  ["down"] = pos.down
};

local directionToDetectFunctionMap = {
  ["forward"] = robot.detect,
  ["back"] = doNothing,
  ["up"] = robot.detectUp,
  ["down"] = robot.detectDown
};

function M.moveAndScan(direction, scanType, times)
  local result = not directionToDetectFunctionMap[direction]();
  if result then
    result = directionToMoveFunctionMap[direction]();
    pos.save();
    orient.save();
    scanTypeMap[scanType][direction](times);
  end
  return result;
end

-- try to reach the desired X or Z coordinate until it fails
function M.approach(target, current, faceAxis, scanType, times)
  if target ~= current then
    local dist = target - current;
    faceAxis(dist);
    for i = 1, math.abs(dist) do
      if not M.moveAndScan('forward', scanType, times) then return false; end
    end
  end
  return true;
end

-- try to reach the desired Y coordinate until it fails
function M.approachY(target, scanType, times)
  if target ~= position.y then

    local dist = target - position.y;

    local direction;
    if dist > 0 then
      direction = 'up';
    else
      direction = 'down';
    end

    for i = 1, math.abs(dist) do
      if not M.moveAndScan(direction, scanType, times) then return false; end
    end

  end
  return true;
end

-- attempt to go to coordinate until we get stuck
function M.to(x, y, z, scanType, times)
  local start = {
    x = position.x,
    y = position.y,
    z = position.z,
  };
  local xReached = M.approach(x, position.x, orient.faceX, scanType, times);
  local zReached = M.approach(z, position.z, orient.faceZ, scanType, times);
  local yReached = M.approachY(y, scanType, times);
  if xReached and zReached and yReached then
    return true;
  elseif
    start.x == position.x and
    start.y == position.y and
    start.z == position.z then
    return false;
  else
    return M.to(x, y, z, scanType, times);
  end
end

return M;
