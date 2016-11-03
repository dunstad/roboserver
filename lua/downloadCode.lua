local os = require('os');

local url = 'https://github.com/dunstad/roboserver/tree/master/lua/';
local filenames = {
  'commandLoop.lua',
  'json.lua',
  'scanDirection.lua',
  'sendScan.lua',
  'tcp.lua',
  'trackLocation.lua',
  'trackOrientation.lua',
};

for index, name in pairs(filenames) do
  os.execute('wget -f ' .. url .. name);
end
