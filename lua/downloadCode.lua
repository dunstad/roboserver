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
};

function downloadAll()
  for index, name in pairs(filenames) do
    download(name);
  end
end

-- rapid reuse may result in receiving cached pages
function download(name)
  os.execute('wget -f ' .. url .. name);
end
