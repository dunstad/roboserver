local robot = require("robot");
dofile 'sendScan.lua' -- todo: properly package this stuff

local orientation = 0;
-- 0: z+, south
-- 1: x+, east
-- 2: z-, north
-- 3: x-, west

-- start using these functions when the robot is facing south.
-- don't revert to using normal turn functions or they'll stop being accurate
function trackTurnLeft()
  robot.turnLeft();
  orientation = (orientation + 1) % 4;
  return orientation;
end

function trackTurnRight()
  robot.turnRight();
  orientation = (orientation - 1) % 4;
  return orientation;
end

function makeScanner(x, z, w, d)
  return function(y, times)
    return scanVolume(x, z, y, w, d, 1, times);
  end;
end

-- functions to scan one row at the end of an axis
local scanZPos = makeScanner(-32, 32, 64, 1);
local scanZNeg = makeScanner(-32, -32, 64, 1);
local scanXPos = makeScanner(32, -32, 1, 64);
local scanXNeg = makeScanner(-32, -32, 1, 64);

local scanForwardMap = {
  [0]=scanZPos,
  [1]=scanXPos,
  [2]=scanZNeg,
  [3]=scanXNeg
};

local scanBackwardMap = {
  [0]=scanZNeg,
  [1]=scanXNeg,
  [2]=scanZPos,
  [3]=scanXPos
};

function scanForward(y, times)
  return scanForwardMap[orientation](y, times);
end

function scanBackward(y, times)
  return scanBackwardMap[orientation](y, times);
end
