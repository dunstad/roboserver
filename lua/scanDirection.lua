local orient = require('trackOrientation');
local scan = require('sendScan');

local M = {};

function M.makeScanner(x, z, w, d)
  return function(y, times)
    return scan.volume(x, z, y, w, d, 1, times);
  end;
end

-- functions to scan one row at the end of an axis
local scanZPosBig = M.makeScanner(-32, 32, 64, 1);
local scanZNegBig = M.makeScanner(-32, -32, 64, 1);
local scanXPosBig = M.makeScanner(32, -32, 1, 64);
local scanXNegBig = M.makeScanner(-32, -32, 1, 64);

local scanBigMap = {
  [0]=scanZPosBig,
  [1]=scanZNegBig,
  [2]=scanXPosBig,
  [3]=scanXNegBig
};

-- functions to scan a small plane in a particular direction
local scanZPosSmall = M.makeScanner(-32, 32, 64, 1);
local scanZNegSmall = M.makeScanner(-32, -32, 64, 1);
local scanXPosSmall = M.makeScanner(32, -32, 1, 64);
local scanXNegSmall = M.makeScanner(-32, -32, 1, 64);

local scanForwardMap = {
  [0]=0,
  [1]=2,
  [2]=1,
  [3]=3
};

local scanBackMap = {
  [0]=1,
  [1]=3,
  [2]=0,
  [3]=2
};

-- orientation is from trackOrientation.lua
function M.forwardBig(y, times)
  return scanBigMap[scanForwardMap[orient.get()]](y, times);
end

function M.backBig(y, times)
  return scanBigMap[scanBackMap[orient.get()]](y, times);
end

function M.forwardSmall(times)
  return scanSmallMap[scanForwardMap[orient.get()]](y, times);
end

function M.forwardSmall(times)
  return scanSmallMap[scanBackMap[orient.get()]](y, times);
end

return M;
