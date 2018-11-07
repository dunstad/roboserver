local os = require('os');

local url = os.getenv('ROBOSERVER_CODE') .. '/';
local filenames = {
  'commandLoop.lua',
  'json.lua',
  'scanDirection.lua',
  'sendScan.lua',
  'tcp.lua',
  'trackPosition.lua',
  'trackOrientation.lua',
  'moveAndScan.lua',
  'adjacent.lua',
  'doToArea.lua',
  'interact.lua',
  'craft.lua',
  'config.lua',
  'config.txt',
};

local M = {};

function M.downloadAll(location)
  for index, name in pairs(filenames) do
    M.download(name, location);
  end
end

-- rapid reuse may result in receiving cached pages
function M.download(name, location)
  os.execute('wget -f ' .. url .. name .. ' ' .. location .. '/' .. name);
end

return M;