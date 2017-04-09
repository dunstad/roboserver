local internet = require('internet');
local JSON = require("json");
local conf = require("config");

local handle = internet.open(conf.serverIP, conf.tcpPort);
handle:setvbuf('line');
-- handle:setTimeout('10');

local M = {};

function M.read()
  -- reads delimited by newlines
  return JSON:decode(handle:read());
end

function M.write(data)
  -- without the newline the write will wait in the buffer
  return handle:write(JSON:encode(data)..'\r\n');
end

M.write({id={account=conf.accountName, robot=conf.robotName}});

return M;
