local path = '/home/lib';
local codeURL = 'https://raw.githubusercontent.com/dunstad/roboserver/master/lua/downloadCode.lua';
os.execute('wget -f ' .. codeURL .. ' ' .. path .. '/downloadCode.lua');
local dl = require("downloadCode");
dl.downloadAll(path);
local config = require("config");
config.easy(config.path);
require('commandLoop');