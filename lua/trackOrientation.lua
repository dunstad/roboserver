local robot = require('robot');
local math = require('math');
local config = require('config');

local orientation = tonumber(config.get(config.path).orient);
-- 0: z+, south
-- 1: x+, east
-- 2: z-, north
-- 3: x-, west

local axisMap = {
  x = {
    pos = 1,
    neg = 3
  },
  z = {
    pos = 0,
    neg = 2
  }
};

local M = {};

function M.save()
  config.set({orient=orientation}, config.path);
end

function M.load()
  orientation = config.get(config.path).orient;
end

function M.set(orient)
  orientation = orient;
end

function M.get()
  return orientation;
end

-- start using these functions when the robot is facing south.
-- don't revert to using normal turn functions or they'll stop being accurate
function M.turnLeft()
  robot.turnLeft();
  orientation = (orientation + 1) % 4;
  return orientation;
end

function M.turnRight()
  robot.turnRight();
  orientation = (orientation - 1) % 4;
  return orientation;
end

-- accepts number of times to turn, pos for left, neg for right
function M.turn(num)
  local turnFunction;
  if num > 0 then
    turnFunction = M.turnLeft;
  else
    turnFunction = M.turnRight;
  end

  for i = 1, math.abs(num) do
    turnFunction();
  end
  return orientation;
end

-- accepts direction to face
function M.face(num)
  assert(num >= 0 and num <= 3, 'facing out of range');
  if num == orientation then return orientation; end
  local distR = num - orientation;
  -- should never have to turn more than twice
  if math.abs(distR) > 2 then
    local distRSign = distR / math.abs(distR);
    local distL = distR - 4 * distRSign;
    return M.turn(distL);
  else
    return M.turn(distR);
  end
end

-- positive number to face x+, negative to face x-
function M.faceX(num)
  local sign = num / math.abs(num);
  if sign > 0 then
    M.face(axisMap.x.pos);
  else
    return M.face(axisMap.x.neg);
  end
end

function M.faceZ(num)
  local sign = num / math.abs(num);
  if sign > 0 then
    M.face(axisMap.z.pos);
  else
    return M.face(axisMap.z.neg);
  end
end

return M;
