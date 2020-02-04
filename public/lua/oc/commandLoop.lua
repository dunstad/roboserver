-- packages that use tcp
function reloadPackages()
  tcp = require('tcp');
  commandMap = require('commandMap');
  dta = require('doToArea');
  int = require('interact');
  sendScan = require('sendScan');
  pos = require('trackPosition');  
end

function reconnect(sleepTime)
  tcp.close();
  -- unloading 'computer' breaks stuff, it can't be required again for some reason
  -- unload all packages that use tcp so they work after reconnecting
  local loadedPackages = {'tcp', 'commandMap', 'doToArea', 'interact', 'sendScan', 'trackPosition'};
  for index, p in pairs(loadedPackages) do
    package.loaded[p] = nil;
  end
  -- wait for server to come back up
  os.sleep(sleepTime or 5);
  -- reconnect to server
  reloadPackages();
end

function loadSafely()
  commandMap = require('commandMap');
  dta = require('doToArea');
  int = require('interact');
  sendScan = require('sendScan');
  pos = require('trackPosition'); 
  scanDirection = require('scanDirection');
  orient = require('trackOrientation');
  mas = require('moveAndScan');
  robot = require('robot');
  adj = require('adjacent');
  craft = require('craft');
  computer = require('computer');
  config = require('config');
  raw = config.get(config.path).raw;
end

-- not much we can do if tcp fails
-- it shouldn't change much though
tcp = require('tcp');
local success, message = pcall(loadSafely);
if not success then
  print(message);
  tcp.write({['message']=message});
  reconnect(15);
end

function unpack (t, i)
  i = i or 1;
  if t[i] ~= nil then
    return t[i], unpack(t, i + 1);
  end
end

-- wait until a command exists, grab it, execute it, and send result back
function executeCommand()
  local data = tcp.read();
  local result = commandMap[data['name']](unpack(data['parameters']));
  tcp.write({['command result']={data['name'], result}});
  tcp.write({['power level']=computer.energy()/computer.maxEnergy()});
end

continueLoop = true;
while continueLoop do
  local success, message = pcall(executeCommand);
  if not success then
    print(message);
    tcp.write({['message']=message});
    reconnect();
  end
end
