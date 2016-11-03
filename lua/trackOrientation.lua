local robot = require("robot");

local orientation = 0;
-- 0: z+, south
-- 1: x+, east
-- 2: z-, north
-- 3: x-, west

local M = {};

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

return M;
