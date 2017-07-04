local path = '/home/lib';
local codeURL = 'https://raw.githubusercontent.com/dunstad/roboserver/1.0.0/public/lua/oc';
local fileName = '/downloadCode.lua'
os.execute('wget -f ' .. codeURL .. fileName .. ' ' .. path .. fileName);
local dl = require("downloadCode");
dl.downloadAll(path);
local config = require("config");
config.easy(config.path);
require('commandLoop');