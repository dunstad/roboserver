local adj = require('adjacent');
local robot = require('robot');
local tcp = require('tcp');
local pos = require('trackPosition');

local M = {};

function M.getMinPoint(p1, p2)
  local minPoint = {x=1e100, y=1e100, z=1e100};
  for axis in pairs(p1) do
    minPoint[axis] = math.min(minPoint[axis], p1[axis], p2[axis])
  end
  return minPoint;
end

function M.getMaxPoint(p1, p2)
  local maxPoint = {x=-1e100, y=-1e100, z=-1e100};
  for axis in pairs(p1) do
    maxPoint[axis] = math.max(maxPoint[axis], p1[axis], p2[axis])
  end
  return maxPoint;
end

function M.generateBoxPoints(corner1, corner2)
  local minPoint = M.getMinPoint(corner1, corner2);
  local maxPoint = M.getMaxPoint(corner1, corner2);
  local points = {};
  for x = minPoint.x, maxPoint.x do
    for y = minPoint.y, maxPoint.y do
      for z = minPoint.z, maxPoint.z do
        table.insert(points, {x=x,y=y,z=z});
      end
    end
  end
  return points;
end

function M.doToAllPoints(pointList, action)
  local success = true;
  for i = 1, #pointList do
    success = success and action(pointList[i]);
  end
  return success;
end

function M.dig(point)
  local robotPos = pos.get();
  local swing = robot.swing;
  if point.y > robotPos.y then
    swing = robot.swingUp;
  elseif point.y < robotPos.y then
    swing = robot.swingDown;
  end
  local swingSuccess = true;
  if robot.detect() then
    swingSuccess = swing();
    if swingSuccess then
      tcp.write({['dig success']=point});
    end
  end
  return swingSuccess;
end

function M.makeApproachAndDig(scanType, times)
  return function (point)
    local moveSuccess = adj.toAdjacent(point, scanType, times);
    local digSuccess = false;
    if moveSuccess then
      digSuccess = M.dig(point);
    end
    return moveSuccess and digSuccess;
  end
end

function M.digArea(p1, p2, index, scanType, times)
  local pointList = M.generateBoxPoints(p1, p2);
  adj.distanceSort(pos.get(), pointList);
  local digAction = M.makeApproachAndDig(scanType, times);
  local actionSuccess = M.doToAllPoints(pointList, digAction);
  tcp.write({['delete selection']=index});
  return actionSuccess;
end

return M;