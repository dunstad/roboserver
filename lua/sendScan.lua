local geolyzer = require('component').geolyzer;
dofile 'tcp.lua'; -- todo: properly package this stuff
dofile 'trackPosition.lua';

function weightedAverage(n1, w1, n2, w2)
  return (n1*w1 + n2*w2)/(w1 + w2);
end

function scanVolume(x, z, y, w, d, h, times)
  -- default to 0 (which is true in lua)
  times = (times - 1) or 0;

  local pos = getPosition();
  local result = {
    x = x + pos.x,
    y = y + pos.y,
    z = z + pos.z,
    w=w,
    d=d,
    data=geolyzer.scan(x, z, y, w, d, h)};

  local weight = 1;
  for i = 1, times do

    local newScan = geolyzer.scan(x, z, y, w, d, h);

    -- average all data points using weights
    for j = 1, result.data.n do
      result.data[j] = weightedAverage(result.data[j], weight, newScan[j], 1);
    end

    weight = weight + 1;

  end
  tcpWrite({['map data']=result});
end

function scanPlane(y, times)
  times = (times - 1) or 0;
  for x = -32, 32 do
    scanVolume(x, -32, y, 1, 64, 1, times);
  end
end
