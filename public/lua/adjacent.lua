local orient = require('trackOrientation');
local pos = require('trackPosition');
local mas = require('moveAndScan');

local M = {};

function M.distance(coord1, coord2)
  local xDist = coord2.x - coord1.x;
  local yDist = coord2.y - coord1.y;
  local zDist = coord2.z - coord1.z;
  return math.sqrt(xDist^2 + yDist^2 + zDist^2);
end

function M.distFromSort(coord1)
  return function(coord2, coord3)
    local dist1 = M.distance(coord1, coord2);
    local dist2 = M.distance(coord1, coord3);
    return dist1 < dist2;
  end
end

function M.distanceSort(start, destinations)
  table.sort(destinations, M.distFromSort(start));
end

function M.getAdjacentPoints(point)
  local negXPoint = {x=point.x-1, y=point.y, z=point.z};
  local posXPoint = {x=point.x+1, y=point.y, z=point.z};
  local posZPoint = {x=point.x, y=point.y, z=point.z+1};
  local negZPoint = {x=point.x, y=point.y, z=point.z-1};
  local negYPoint = {x=point.x, y=point.y-1, z=point.z};
  local posYPoint = {x=point.x, y=point.y+1, z=point.z};
  return {negXPoint, posXPoint, negZPoint, posZPoint, negYPoint, posYPoint};
end

function M.facePoint(point)
  local start = pos.get();
  if point.x ~= start.x then
    orient.faceX(point.x - start.x);
  elseif point.z ~= start.z then
    orient.faceZ(point.z - start.z);
  end
  return orient.get();
end

function M.toAdjacent(point, scanType, times)
  local adjacentPoints = M.getAdjacentPoints(point);
  M.distanceSort(pos.get(), adjacentPoints);
  local success = false;
  for index, adjPoint in pairs(adjacentPoints) do
    if not success then
      success = mas.to(adjPoint.x, adjPoint.y, adjPoint.z, scanType, times);
    end
  end
  M.facePoint(point);
  orient.save();
  return success;
end

return M;
