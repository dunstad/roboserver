local geolyzer = require("component").geolyzer;
dofile "tcp.lua"; -- todo: properly package this stuff

function scanVolume(x, z, y, w, d, h)
  local result = {x=x, y=y, z=z, w=w, d=d, data=geolyzer.scan(x, z, y, w, d, h)};
  tcpWrite({['map data']=result});
end

function scanPlane(y)
  for x = -32, 31 do
    scanVolume(x, -32, y, 1, 64, 1);
  end
end
