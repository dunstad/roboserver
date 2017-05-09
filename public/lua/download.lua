local component = require("component")
local fs = require("filesystem")
local internet = require("internet")
local shell = require("shell")
local text = require("text")

function download(name)
  if not component.isAvailable("internet") then
    io.stderr:write("This program requires an internet card to run.");
    return false;
  end

  local url = 'https://raw.githubusercontent.com/dunstad/roboserver/master/lua/' .. name;
  local filename = name;

  local f, reason = io.open('/home/lib/' .. name, "wb");
  if not f then
    io.stderr:write("failed opening file for writing: " .. reason);
    return nil, "failed opening file for writing: " .. reason;
  end

  io.write("Downloading... ");
  local result, response = pcall(internet.request, url);
  if result then
    local result, reason = pcall(function()
      for chunk in response do
        f:write(chunk);
      end
    end);
    if not result then
      io.stderr:write("failed.\n");
      f:close();
      fs.remove(filename);
      io.stderr:write("HTTP request failed: " .. reason .. "\n");
      return nil, reason;
    end
    io.write("success.\n");

    f:close()
    io.write("Saved data to " .. filename .. "\n");
  else
    io.write("failed.\n");
    f:close();
    fs.remove(filename);
    io.stderr:write("HTTP request failed: " .. response .. "\n");
    return nil, response;
  end
  return true;
end