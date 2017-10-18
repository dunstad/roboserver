# 1.1

## fixes
* refactor interface code
  * un-hardcode ids and move them to GUI
  * decouple maprender and gui?
* window resize before camera exists error?

## features
* add validators to web client
* add unit tests for web client
* change oc lua code to use new command structure
  * update inventory slot to have nil instead of empty tables
  * update dig to use 6 parameters instead of two table strings
* display current version number
  * is the version number stored in a single place right now?

# 1.2
* port oc lua to cc
  * create new scanner compatible with both?

# later

## big
* blueprint storage and rendering
* mapping:
  * Set up database
  * persistent server side maps that robots can read
  * dimension selector to handle robots in different dimensions or worlds
    * while we're changing the ui, put scan size selector next to scan button
  * detect maximum scan batch size based on available memory
  * don't add to the scene any voxels which are surrounded?
  * merge and split voxel meshes based on distance from robot
    * sort of like how minecraft loads chunks, hopefully this approach would improve rendering speed
    * impossible to retain individual coloring?
* alternate reality glasses roboserver client
  * fork openglasses
  * make it work with computercraft
  * highlight the block we're looking at
  * implement move command on punch first
  * create a way to select a tool in the overlay
  * implement the other tools
  * display contents of inventories when looking at them
  * use map data for x-ray vision?
* visual tool for chaining robot commands together to automate tasks
  * first make an action recording feature
  * specify number of loops, duration of sleep between
* edit lua files on robot with an editor in browser

## small
* change gui based on what components the selected robot has
  * modularize lua code so more of the requires/components are optional
  * allow limited functionality without crafting component
  * allow limited functionality without inventory controller
  * allow limited functionality without geolyzer
* customizable crafting recipes
* all known inventories tracked per account, robots check those first when crafting or building
* virtual items/blocks?
* perform initial configuration from application?
* hotkeys for different tools
* find blocks feature (make non-matches mostly transparent)
* allow robot install to default to offline instead of always using github 
* current order of acting on an area of blocks not the most efficient
  * maybe do a column at a time but sort those by distance
  * alternatively sort all the points by distance after each action
* split command history by robot
* display most recently equipped item
* turn hardness values into hardness classes based on data accuracy
  * i.e., say a block could be either hardness 2 or 1.5
  * show hardness classes for the block the cursor is on
  * highlight blocks of a specific hardness class
  * highlight neighbors of a block that fit in the same hardness class
* ability to change key bindings
* item label to facade color map, use for map and inventory
* see if we can make water source and flow blocks render differently
* render robot facing (triangular prism or different colored face)
  * send orientation
* add external->external transfer support (use a robot slot)
* drop items function in interface
* make water/lava transparent
* use furnaces automatically during crafting
* improve rendering color schemes
* make account registration create a new robot if server is on no-player mode
* set waypoints to account for complicated pathing
* how to split up a selection among multiple robots?
  * vertically should work fine most of the time

