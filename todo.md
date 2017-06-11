# version 1

## features

## fixes
* robot failing to place one block should not prevent it from placing others
  * not sure why this is happening right now
* other blocks should not be colored light pink, why's it happening?
  * robots are apparently stone colored when not selected?
* make robot install use pastebin

## pre-release
* test things
* update readme
* set up github so i can develop without breaking the release
* update install script to point to release

# later

## fixes
* disallow dragging empty inventory slots
  
## features
split command history by robot
* allow robot install to default to offline instead of always using github 
* computercraft support
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
