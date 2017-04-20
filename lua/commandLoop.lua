tcp = require('tcp');
orient = require('trackOrientation');
pos = require('trackPosition');
sendScan = require('sendScan');
scanDirection = require('scanDirection');
mas = require('moveAndScan');
robot = require('robot');
dl = require('downloadCode');
adj = require('adjacent');
dta = require('doToArea');
int = require('interact');
craft = require('craft');
computer = require('computer');

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
      local command = load(v, nil, 't', _ENV);
      print(v);
      local status, result = pcall(command);
      print(status, result);
      tcp.write({['command result']={status, result}});
      tcp.write({['power level']=computer.energy()/computer.maxEnergy()});
    end
  end
end

continueLoop = true;
while continueLoop do
  if not pcall(executeCommand) then
    package.loaded.tcp = nil;
    package.loaded.sendScan = nil;
    package.loaded.trackPosition = nil;
    package.loaded.doToArea = nil;
    package.loaded.interact = nil;
    -- wait for server to finish restarting
    os.sleep(5);
    -- reconnect to server
    tcp = require('tcp');
    sendScan = require('sendScan');
    pos = require('trackPosition');
    dta = require('doToArea');
    int = require('interact');
  end
end
