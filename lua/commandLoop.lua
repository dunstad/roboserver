-- todo: properly set environment for load
tcp = require('tcp');
orient = require('trackOrientation');
pos = require('trackPosition');
sendScan = require('sendScan');
scanDirection = require('scanDirection');
mas = require('moveAndScan');
robot = require("robot");

function runInTerminal(commandText)
  local file = assert(io.popen(commandText, 'r'));
  local output = file:read('*all');
  file:close();
  return output;
end

-- wait until a command exists, grab it, execute it, and send result back
function executeCommand()
  local data = tcp.read();
  for k, v in pairs(data) do
    if k == 'message' then
      print(v);
    end
    if k == 'command' then
      local command = load(v, nil, "t", _ENV);
      print(v);
      local status, result = pcall(command);
      print(status, result);
      tcp.write({['command result']={status, result}});
    end
  end
end

continueLoop = true;
while continueLoop do
  if not pcall(executeCommand) then
    package.loaded.tcp = nil;
    package.loaded.sendScan = nil;
    package.loaded.trackPosition = nil;
    -- wait for server to finish restarting
    os.sleep(5);
    -- reconnect to server
    tcp = require('tcp');
    pos = require('trackPosition');
    sendScan = require('sendScan');
  end
end
