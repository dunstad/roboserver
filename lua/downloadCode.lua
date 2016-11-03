local os = require('os');

local url = 'https://raw.githubusercontent.com/dunstad/roboserver/master/lua/';
local filenames = {
  'commandLoop.lua',
  'json.lua',
  'scanDirection.lua',
  'sendScan.lua',
  'tcp.lua',
  'trackLocation.lua',
  'trackOrientation.lua',
};

function downloadAll()
  for index, name in pairs(filenames) do
    os.execute('wget -f ' .. url .. name);
  end
end

function download(name)
  os.execute('wget -f ' .. url .. name);
end
