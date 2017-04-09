local os = require('os');

local url = 'https://raw.githubusercontent.com/dunstad/roboserver/master/lua/';
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
};

local M = {};

function M.downloadAll()
  for index, name in pairs(filenames) do
    M.download(name);
  end
end

-- rapid reuse may result in receiving cached pages
function M.download(name)
  os.execute('wget -f ' .. url .. name);
end

return M;