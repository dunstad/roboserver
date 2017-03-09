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

return M;
