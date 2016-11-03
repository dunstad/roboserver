local internet = require('internet');
local JSON = assert(loadfile "JSON.lua")();

local handle = internet.open('127.0.0.1', 3001);
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

return M;
