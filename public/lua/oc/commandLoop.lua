function loadPackages()
  tcp = require('tcp');
  orient = require('trackOrientation');
  pos = require('trackPosition');
  sendScan = require('sendScan');
  scanDirection = require('scanDirection');
  mas = require('moveAndScan');
  robot = require('robot');
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

local commandMap = require('commandMap');

function runInTerminal(commandText)
  local file = assert(io.popen(commandText, 'r'));
  local output = file:read('*all');
  file:close();
  return output;
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
    tcp.close();
    -- unloading 'computer' breaks stuff, it can't be required again for some reason
    -- really we don't need to reload every one of these, but this is easiest
    local loadedPackages = {'tcp', 'trackOrientation', 'trackPosition', 'sendScan', 'scanDirection', 'moveAndScan', 'robot', 'adjacent', 'doToArea', 'interact', 'craft', 'config'};
    for index, p in pairs(loadedPackages) do
      package.loaded[p] = nil;
    end
    -- wait for server to come back up
    os.sleep(5);
    -- reconnect to server
    loadPackages();
  end
end
