function runInTerminal(commandText)
  local file = assert(io.popen(commandText, 'r'));
  local output = file:read('*all');
  file:close();
  return output;
end

local commands = {
  'mkdir /home/lib',
  'wget -f https://raw.githubusercontent.com/dunstad/roboserver/master/lua/downloadCode.lua /home/lib/downloadCode.lua',
  'cd /home/lib && lua "require(\'downloadCode\').downloadAll();"',
};

for index, command in pairs(commands) do
  os.execute(command);
end