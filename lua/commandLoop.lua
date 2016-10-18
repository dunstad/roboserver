local inet = require("internet")
local JSON = assert(loadfile "JSON.lua")()
robot = require("robot")

function getCommands()
  local req = inet.request("https://roboserver.herokuapp.com/commands")
  local serverJson = ""
  for line in req do
    serverJson = serverJson .. line .. "\n"
  end

  local commands = JSON:decode(serverJson)
  for i = 1, #commands do
    local command = load(commands[i], nil, "t", _ENV)
    local status, err = pcall(command)
    if status then
      print(commands[i]);
    else
      print(err)
    end
  end
end

while true do
  getCommands()
  os.sleep(3)
end
