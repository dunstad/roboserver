local adj = require('adjacent');

local M = {};

function M.getMinPoint(p1, p2)
  local minPoint = {x=1e100, y=1e100, z=1e100};
  for axis in pairs(p1) do
    minPoint[axis] = math.min(minPoint[axis], p1[axis], p2[axis])
  end
  return minPoint;
end

function M.getMaxPoint(p1, p2)
  local maxPoint = {x=0, y=0, z=0};
  for axis in pairs(p1) do
    maxPoint[axis] = math.max(maxPoint[axis], p1[axis], p2[axis])
  end
  return maxPoint;
end

function M.generateBoxPoints(corner1, corner2)
  local minPoint = getMinPoint(corner1, corner2);
  local maxPoint = getMaxPoint(corner1, corner2);
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

return M;