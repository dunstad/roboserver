local orient = require('trackOrientation');
local pos = require('trackPosition');

local M = {};

function M.getAdjacent(coord)

end

function M.distance(coord1, coord2)
  local xDist = coord2.x - coord1.x;
  local yDist = coord2.y - coord1.y;
  local zDist = coord2.z - coord1.z;
  return math.sqrt(xDist^2 + yDist^2 + zDist^2);
end

function M.distFromSort(coord1)
  return function(coord2, coord3)
    local dist1 = distance(coord1, coord2);
    local dist2 = distance(coord1, coord3);
    return dist1 < dist2;
  end
end

function M.distanceSort(start, destinations)
  table.sort(destinations, distFromSort(start));
end

function M.facePoint(point)
  local start = pos.get();
  if point.x ~= start.x then
    orient.faceX(point.x - start.x);
  else if point.z ~= start.z then
    orient.faceZ(point.z - start.z);
  end
  return orient.get();
end

function M.adjacentPoints(point)
  local negXPoint = {point.x-1, point.y, point.z};
  local posXPoint = {point.x+1, point.y, point.z};
  local negZPoint = {point.x, point.y, point.z-1};
  local posZPoint = {point.x, point.y, point.z+1};
  local negYPoint = {point.x, point.y-1, point.z};
  local posYPoint = {point.x, point.y+1, point.z};
  return {negXPoint, posXPoint, negZPoint, posZPoint, negYPoint, posYPoint};
end

function toAdjacent()

end

return M;
