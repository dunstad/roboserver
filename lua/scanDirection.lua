local orient = require('trackOrientation');
local scan = require('sendScan');

local M = {};

function M.makeScanner(x, z, w, d)
  return function(y, times)
    return scan.volume(x, z, y, w, d, 1, times);
  end;
end

-- functions to scan one row at the end of an axis
local scanZPos = M.makeScanner(-32, 32, 64, 1);
local scanZNeg = M.makeScanner(-32, -32, 64, 1);
local scanXPos = M.makeScanner(32, -32, 1, 64);
local scanXNeg = M.makeScanner(-32, -32, 1, 64);

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

-- orientation is from trackOrientation.lua
function M.forward(y, times)
  return scanForwardMap[orient.get()](y, times);
end

function M.back(y, times)
  return scanBackMap[orient.get()](y, times);
end

return M;
