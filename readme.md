## Roboserver

This is a HTTP and TCP server which OpenComputers robots can read and execute commands from.  

**Getting Started**
To run the HTTP/TCP server: `npm start` or `npm run dev` from the root directory. This allows you to access the web client and send messages to any listening robots.

You may find that you need to change the OpenComputers configuration file to allow it to connect to your server.

In order to set up a robot, use copy/paste or `wget` to get `/lua/downloadCode.lua` onto it. Make sure the file is in a directory covered by Lua's `package.path` variable (ex. `/home/lib/`).

Run `downloadAll()` from the Lua interpreter to retrieve the rest of the code from the Lua folder of the repository.

Run `lua /home/lib/commandLoop.lua` (if that's where you installed it) to have the robot begin listening for commands from the web client. This will fail unless the robot is equipped with a Geolyzer.

Make sure the robot is facing south when you begin listening to the web client. (see lua/trackOrientation.lua)

If you need the robot to stop listening, send `continueLoop=false` from the web client.

list of components required for full functionality
internet card, geolyzer, inventory controller, crafting upgrade, minimum 16 slots of inventory space
optional chunk loader

what version of opencomputers and openos do we need?

control+drag to split stacks
hold alt to put the selector inside a block

place uses selected slot, not equip slot