local robot = require("robot");

local orientation = 0;
-- 0: z+, south
-- 1: x+, east
-- 2: z-, north
-- 3: x-, west

function setOrientation(orient)
  orientation = orient;
end

function getOrientation()
  return orientation;
end

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
