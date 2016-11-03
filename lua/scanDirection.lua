dofile 'trackOrientation.lua' -- todo: properly package this stuff
dofile 'sendScan.lua' -- todo: properly package this stuff

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

-- orientation is from trackOrientation.lua
function scanForward(y, times)
  return scanForwardMap[getOrientation()](y, times);
end

function scanBackward(y, times)
  return scanBackwardMap[getOrientation()](y, times);
end
