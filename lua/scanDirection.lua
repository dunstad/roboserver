local orient = require('trackOrientation');
local scan = require('sendScan');

function makeScanner(x, z, w, d)
  return function(y, times)
    return scan.scanVolume(x, z, y, w, d, 1, times);
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

local scanBackMap = {
  [0]=scanZNeg,
  [1]=scanXNeg,
  [2]=scanZPos,
  [3]=scanXPos
};

local M = {};

-- orientation is from trackOrientation.lua
function M.scanForward(y, times)
  return scanForwardMap[orient.get()](y, times);
end

function M.scanBack(y, times)
  return scanBackMap[orient.get()](y, times);
end

return M;
