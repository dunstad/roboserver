local ser = require("serialization");

local configPath = "/home/lib/config.txt";

local promptMap = {
    robotName = "Enter a name for your robot.",
    accountName = "Enter your Roboserver account name.",
    serverIP = "Enter the IP address of your Roboserver.",
    serverPort = "Enter the port of your Roboserver.",
    tcpPort = "Enter the TCP port for your Roboserver.",
    posX = "Enter your robot's X coordinate.",
    posY = "Enter your robot's Y coordinate.",
    posZ = "Enter your robot's Z coordinate.",
    orient = "Enter 0 if your robot is facing South, 1 if East, 2 if North, 3 if West.",
    raw = "Enter true to allow raw Lua commands to run on this robot, false to ignore them.",
  };

function readFile(path)
  local file = io.open(path, "r");
  if not file then return nil; end
  local content = file:read("*all");
  file:close();
  return content;
end

function getConfig(filePath)
  local config = {};
  local content = readFile(filePath);
  if content then
    config = ser.unserialize(content);
  end
  return config;
end

function setConfig(configTable, filePath)
  local file = io.open(filePath, "w");
  local configString = ser.serialize(configTable);
  file:write(configString);
  file:close();
  return configString;
end

function setConfigOptions(options, path)
  local config = getConfig(path);
  for key, value in pairs(options) do
    config[key] = value;
  end
  return setConfig(config, path)
end

function readNotEmpty()
  local result = nil;
  local value = io.read();
  if value ~= "" then result = value; end
  return result;
end

function readNewConfigOption(prompt, oldValue)
  print(prompt);
  if oldValue then
    print("Current value: " .. oldValue);
  end
  return readNotEmpty() or oldValue;
end

function readConfigOptions(options, path)
  local oldConfig = getConfig(path);
  print("Changing configuration. Just press enter to leave a value unchanged.");
  for i, property in pairs(options) do
    oldConfig[property] = readNewConfigOption(promptMap[property], oldConfig[property]);
  end
  return setConfig(oldConfig, path);
end

function easyConfig(path)
  local promptOrder = {"serverIP", "serverPort", "accountName", "robotName", "posX", "posY", "posZ", "orient"};
  local result = readConfigOptions(promptOrder, path);
  setAvailableComponents(path);
  return result;
end

local arg = {...};
if arg[1] and arg[2] and not (arg[1] == 'config') then
  setConfigOptions({[arg[1]]=arg[2]}, "/home/lib/config.txt");
  print('Set config option ' .. arg[1] .. ' to ' .. arg[2]);
elseif not (arg[1] == 'config') then
  print('Usage: lua /home/lib/config.lua settingName settingValue');
end

function setAvailableComponents(path)
  local availableComponents = {};
  setConfigOptions({components=availableComponents}, path);
end

return {
  get = getConfig,
  set = setConfigOptions,
  easy = easyConfig,
  path = configPath,
};