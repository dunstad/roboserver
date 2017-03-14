local adj = require('adjacent');
local robot = require('robot');
local tcp = require('tcp');

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

function M.dig()
  local swingSuccess = robot.swing();
  local writeSuccess = false;
  if swingSuccess then
    writeSuccess = tcp.write({['dig success']=point});
  end
  return swingSuccess and writeSuccess;
end

function M.makeApproachAndDig(scanType, times)
  return function (point)
    local moveSuccess = adj.toAdjacent(point, scanType, times);
    local digSuccess = false;
    if moveSuccess then
      digSuccess = M.dig();
    end
    return moveSuccess and digSuccess;
  end
end

function M.digArea(p1, p2, index, scanType, times)
  local pointList = M.generateBoxPoints(p1, p2);
  local digAction = M.makeApproachAndDig(scanType, times);
  local actionSuccess = M.doToAllPoints(pointList, digAction);
  local writeSuccess = tcp.write({['delete selection']=index});
  return actionSuccess and writeSuccess;
end

return M;