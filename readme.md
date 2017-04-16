## Roboserver

This is a HTTP and TCP server which OpenComputers robots can read and execute commands from.  

**Getting Started**
To run the HTTP/TCP server: `npm start` or `npm run dev` from the root directory. This allows you to access the web client and send messages to any listening robots.

You may find that you need to change the OpenComputers configuration file to allow it to connect to your server.

Paste the command from lua/install.txt into your robot after ensuring it meets the minumum requirements.

Run `lua /home/lib/commandLoop.lua` to have the robot begin listening for commands from the web client.

If you need the robot to stop listening, send `continueLoop=false` from the web client.

what version of opencomputers and openos do we need?

control+drag to split stacks
hold alt to put the selector inside a block

place uses selected slot, not equip slot

opencomputers minimum system requirements
  gold case
  t2 cpu
  t1 memory x2
  EEPROM (Lua BIOS)
  t1 hard disk drive with OpenOS installed
  internet card

  geolyzer
  inventory controller
  crafting upgrade
  inventory upgrade