local path = '/home/lib';
local os = require('os');
local codeURL = os.getenv('ROBOSERVER_CODE');
local fileName = '/downloadCode.lua'
os.execute('wget -f ' .. codeURL .. fileName .. ' ' .. path .. fileName);
local dl = require("downloadCode");
dl.downloadAll(path);
local config = require("config");
config.easy(config.path);
require('commandLoop');
