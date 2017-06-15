# version 1

## features

## fixes
* make robot install use pastebin

## features

## pre-release
* test things
* update readme
* set up github so i can develop without breaking the release
* update install script to point to release

# 1.1

## fixes
* telling the robot to cat a longish file crashes the server
  * need to make the server properly handle tcp messages that get broken into parts
* disallow dragging empty inventory slots
* names can appear twice in the robot select
* move select mesh when selected robot disconnects

## features
* computercraft support (kind of)
  * this means taking the lua code in commandMap.js and putting it directly on the robot
  * commandMap.js will send json that represents the command we want to perform and any parameters
  * we'll leave how those commands are executed up to the client receiving them
* redo the test client to act based on the new command structure
  * make a fake world for the test client to interact with
  * should be able to move, dig, place, inspect, open inventories and move items around
* automate testing (selenium? webdriver?)

# later
* customizable crafting recipes
* split command history by robot
* allow robot install to default to offline instead of always using github 
* perform initial configuration from application?
* display most recently equipped item
* hotkeys for different tools
* turn hardness values into hardness classes based on data accuracy
  * i.e., say a block could be either hardness 2 or 1.5
  * show hardness classes for the block the cursor is on
  * highlight blocks of a specific hardness class
  * highlight neighbors of a block that fit in the same hardness class
* ability to change key bindings
* item label to facade color map, use for map and inventory
* change gui based on what components the selected robot has
  * modularize lua code so more of the requires/components are optional
* allow limited functionality without crafting component
* allow limited functionality without inventory controller
* allow limited functionality without geolyzer
* see if we can make water source and flow blocks render differently
* render robot facing (triangular prism or different colored face)
  * send orientation
* add external->external transfer support (use a robot slot)
* drop items function in interface
* add moveVoxel for lighter robot movement in rendering code
* make water/lava transparent
* action recording feature to make automation easy
  * specify number of loops, duration of sleep between
* use furnaces automatically during crafting
* improve rendering color schemes
* make account registration create a new robot if server is on no-player mode

# distant future
* set waypoints in account for complicated pathing
* all known inventories tracked per account, robots check those first when crafting or building
* how to split up a selection among multiple robots?
  * vertically should work fine most of the time
* visual tool for chaining robot commands together to automate tasks
* edit lua files on robot with an editor in browser
* blueprint storage and rendering
* neural network to help predict block ids from hardness maps
* mapping:
  * Set up database
  * persistent server side maps that robots can read
  * add ability to send scans to different maps? or is it one roboserver per mc server?
  * detect maximum scan batch size based on available memory
  * don't add to the scene any voxels which are surrounded?
  * merge and split voxel meshes based on distance from robot
    * sort of like how minecraft loads chunks, hopefully this approach would improve rendering speed
    * impossible to retain individual coloring?
