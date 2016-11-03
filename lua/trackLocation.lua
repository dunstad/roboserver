local robot = require("robot");
dofile "tcp.lua"; -- todo: properly package this stuff
dofile 'trackOrientation.lua' -- todo: properly package this stuff

-- wherever you start using these functions is considered 0, 0, 0
-- don't stop using them once you start or they won't be accurate
local position = {x=0, y=0, z=0};

function setPosition(x, y, z)
  position = {x=x, y=y, z=z};
end

function getPosition()
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
function trackForward()
  -- the loop will only perform one iteration
  -- this is just a way to treat the properties generically
  for axis, change in pairs(forwardMap[orientation]) do
    position[axis] = position[axis] + change;
  end
  sendLocation();
  return position;
end

function trackBack()
  -- the loop will only perform one iteration
  -- this is just a way to treat the properties generically
  for axis, change in pairs(backwardMap[orientation]) do
    position[axis] = position[axis] + change;
  end
  sendLocation();
  return position;
end

function trackUp()
  position.y = position.y + 1;
  sendLocation();
  return position;
end

function trackDown()
  position.y = position.y - 1;
  sendLocation();
  return position;
end

function sendLocation()
  return tcpWrite({['robot position']=position});
end
