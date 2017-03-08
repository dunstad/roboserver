local orient = require('trackOrientation');
local scan = require('sendScan');

local M = {};

function M.makeBigScanner(x, z, w, d)
  return function(y, times)
    return scan.volume(x, z, y, w, d, 1, times);
  end;
end

-- functions to scan one row at the end of an axis
local scanZPosBig = M.makeBigScanner(-32, 32, 64, 1);
local scanZNegBig = M.makeBigScanner(-32, -32, 64, 1);
local scanXPosBig = M.makeBigScanner(32, -32, 1, 64);
local scanXNegBig = M.makeBigScanner(-32, -32, 1, 64);

local scanBigMap = {
  [0]=scanZPosBig,
  [1]=scanZNegBig,
  [2]=scanXPosBig,
  [3]=scanXNegBig
};

function M.makeSmallScanner(x, z, w, d)
  return function(times)
    return scan.volume(x, z, -2, w, d, 8, times);
  end;
end

-- scan.volume(-3, -3, 8, 8)
-- functions to scan a small plane in a particular direction
local scanZPosSmall = M.makeSmallScanner(-3, 4, 8, 1);
local scanZNegSmall = M.makeSmallScanner(-3, -3, 8, 1);
local scanXPosSmall = M.makeSmallScanner(4, -3, 1, 8);
local scanXNegSmall = M.makeSmallScanner(-3, -3, 1, 8);

local scanSmallMap = {
  [0]=scanZPosSmall,
  [1]=scanZNegSmall,
  [2]=scanXPosSmall,
  [3]=scanXNegSmall
};


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

function M.upBig(times)
  return scan.plane(7);
end;

function M.downBig(times)
  return scan.plane(-1);
end;

function M.forwardSmall(times)
  return scanSmallMap[scanForwardMap[orient.get()]](y, times);
end

function M.backSmall(times)
  return scanSmallMap[scanBackMap[orient.get()]](y, times);
end

function M.upSmall(times)
  return scan.volume(-3, -3, 5, 8, 8, 1, times);
end

function M.downSmall(times)
  return scan.volume(-3, -3, -2, 8, 8, 1, times);
end

return M;
