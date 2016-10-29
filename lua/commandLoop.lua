dofile "tcp.lua"; -- todo: properly package this stuff

-- todo: properly set environment for load
robot = require("robot");

-- wait until a command exists, grab it, execute it, and send result back
function executeCommand()
  local data = tcpRead();
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
        tcpWrite({['command result']=result});
      else
        tcpWrite({['command result']='OK'});
      end
    end
  end
end

-- todo allow breaking this loop somehow
while true do
  executeCommand();
end
