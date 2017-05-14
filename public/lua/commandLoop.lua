function loadPackages()
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
  config = require('config');
  raw = config.get(config.path).components.raw;
  rawBool = (raw == "true" or raw == true) and true or false;
end
loadPackages();

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
    if k == 'command' or k == 'raw command' and rawBool then
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
    -- unloading 'computer' breaks stuff, it can't be required again for some reason
    -- really we don't need to reload every one of these, but this is easiest
    local loadedPackages = {'tcp', 'trackOrientation', 'trackPosition', 'sendScan', 'scanDirection', 'moveAndScan', 'robot', 'downloadCode', 'adjacent', 'doToArea', 'interact', 'craft', 'config'};
    for index, p in pairs(loadedPackages) do
      package.loaded[p] = nil;
    end
    -- wait for server to come back up
    os.sleep(5);
    -- reconnect to server
    loadPackages();
  end
end
