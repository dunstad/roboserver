local inet = require("internet");
local JSON = assert(loadfile "JSON.lua")();
local geolyzer = require("component").geolyzer;

function scanArea(minX, minZ, maxX, maxZ)
  local scan = {};
  for x = minX, maxX do
    for z = minZ, maxZ do
      local colTable = {x=x, z=z, data=geolyzer.scan(x, z)};
      table.insert(scan, colTable);
    end
  end
  return scan;
end

function sendScan(scan)
  local req = inet.request("https://roboserver.herokuapp.com/map", {map=JSON:encode(scan)});
  local serverJson = "";
  for line in req do
    serverJson = serverJson .. line .. "\n"
  end
  return serverJson;
end
