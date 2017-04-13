local ser = require("serialization");

local configPath = "config.txt";

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

function readNotEmpty()
  local result = nil;
  local value = io.read();
  if value ~= "" then result = value; end
  return result;
end

function getNewConfigOption(prompt, oldValue)
  print(prompt);
  if oldValue then
    print("Current value: " .. oldValue);
  end
  return readNotEmpty() or oldValue;
end

function easyConfig()
  local newConfig = {};
  local oldConfig = getConfig(configPath);

  local promptMap = {
    robotName = "Enter a name for your robot.",
    accountName = "Enter your Roboserver account name.";
    serverIP = "Enter the IP address of your Roboserver.";
    tcpPort = "Enter the TCP port for your Roboserver.";
  };

  local promptOrder = {"robotName", "accountName", "serverIP", "tcpPort"};

  print("Changing configuration. Just press enter to leave a value unchanged.");

  for i, property in pairs(promptOrder) do
    newConfig[property] = getNewConfigOption(promptMap[property], oldConfig[property]);
  end

  return setConfig(newConfig, configPath);
end

return {
  get = getConfig,
  set = setConfig,
  easy = easyConfig,
  path = configPath,
};