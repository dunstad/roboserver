-- todo: properly set environment for load
tcp = require('tcp');
orient = require('trackOrientation');
pos = require('trackPosition');
sendScan = require('sendScan');
scanDirection = require('scanDirection');
robot = require("robot");

-- wait until a command exists, grab it, execute it, and send result back
function executeCommand()
  local data = tcp.read();
  for k, v in pairs(data) do
    if k == 'message' then
      print(v);
    end
    if k == 'command' then
      local command = load(v, nil, "t", _ENV);
      local status, result = pcall(command);
      print(v);
      if result then
        print(result);
        tcp.write({['command result']=result});
      else
        tcp.write({['command result']='OK'});
      end
    end
  end
end

continueLoop = true;
while continueLoop do
  if not pcall(executeCommand) then
    package.loaded.tcp = nil;
    -- wait for server to finish restarting
    os.sleep(5);
    -- reconnect to server
    tcp = require('tcp');
  end
end
