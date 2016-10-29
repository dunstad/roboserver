local internet = require('internet');
local JSON = assert(loadfile "JSON.lua")();

handle = internet.open('127.0.0.1', 3001);
handle:setvbuf('line');
-- handle:setTimeout('10');

function tcpRead()
  -- reads delimited by newlines
  return JSON:decode(handle:read());
end

function tcpWrite(data)
  -- without the newline the write will wait in the buffer
  return handle:write(JSON:encode(data)..'\r\n');
end
