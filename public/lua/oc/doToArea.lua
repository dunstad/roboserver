local adj = require('adjacent');
local robot = require('robot');
tcp = require('tcp'); -- if this is local, reloading modules fails in commandLoop
local pos = require('trackPosition');
local component = require('component');
if not component.isAvailable('geolyzer') then
  error('Geolyzer not found');
end
local geolyzer = component.geolyzer;
local int = require('interact');

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
    success = action(pointList[i]) and success;
  end
  return success;
end

function M.makeApproachAndDoAction(action, scanType, times)
  return function (point)
    local moveSuccess = adj.toAdjacent(point, scanType, times);
    local actionSuccess = false;
    if moveSuccess then
      actionSuccess = action(point);
    end
    return moveSuccess and actionSuccess;
  end
end

function M.makeDoActionToArea(action)
  return function (x1, y1, z1, x2, y2, z2, index, scanType, times)
    local p1 = {x=x1, y=y1, z=z1};
    local p2 = {x=x2, y=y2, z=z2};
    local pointList = M.generateBoxPoints(p1, p2);
    adj.distanceSort(pos.get(), pointList);
    local approachAndDoAction = M.makeApproachAndDoAction(action, scanType, times);
    local actionSuccess = M.doToAllPoints(pointList, approachAndDoAction);
    tcp.write({['delete selection']=index});
    return actionSuccess;
  end
end

function M.dig(point)
  local robotPos = pos.get();
  local pointSide = 3; -- front
  if point.y > robotPos.y then
    pointSide = 1; -- top
  elseif point.y < robotPos.y then
    pointSide = 0; -- bottom
  end
  local swingSuccess = true;
  if component.robot.detect(pointSide) then
    swingSuccess = component.robot.swing(pointSide);
    if swingSuccess then
      tcp.write({['dig success']=point});
    end
  end
  return swingSuccess;
end

M.digArea = M.makeDoActionToArea(M.dig);

function M.place(point)
  local robotPos = pos.get();
  local pointSide = 3; -- front
  if point.y > robotPos.y then
    pointSide = 1; -- top
  elseif point.y < robotPos.y then
    pointSide = 0; -- bottom
  end
  local placeSuccess = component.robot.place(pointSide);
  if placeSuccess then
    local blockData = geolyzer.analyze(pointSide);
    blockData.point = point;
    tcp.write({['block data']=blockData});
    int.sendSlotData(-1, robot.select());
  end
  return placeSuccess;
end

M.placeArea = M.makeDoActionToArea(M.place);

return M;