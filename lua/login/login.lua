local debug = require("component").debug;
local world = debug.getWorld();

function getBlock(x, y, z)
  return {
    ["id"] = world.getBlockId(x, y, z),
    ["metadata"] = world.getMetadata(x, y, z),
    ["nbt"] = world.getTileNBT(x, y, z)
  };
end

function setBlock(x, y, z, block)
  world.setBlock(x, y, z, block["id"], 0); -- need to get numeric metadata into block["metadata"]
  world.setTileNBT(x, y, z, block["nbt"]);
end