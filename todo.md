* pretty sure the big scan is rotated the wrong way
* accidentally doing absolute instead of relative coordinates sucks...
  * default to relative, use string "absolute" instead of a boolean
* allow specifying only one coordinate for dig and place?
* bots could be smarter about automatically stacking items
* test crafting multiple things in one command
* saplings and other plants impede movement and are invisible to the geolyzer
* still can't specify which robot receives commands in cli
* don't know the name of the item i want to craft

* add documentation to cli for commands that need it
  * locate command
    * locate name \[amount\]
      * no amount means it's a block
    * server replies with coordinates of an inventory or block

* gather command, dig blocks matching gather list
  * just use equipped tool first
  * minecraft-data seems to provide harvestTools for blocks though

* build by specifying block name rather than using current slot
  * new parameters or a new command?

* add wander to movement for when pathing fails
  * or do some proper pathfinding

* setting to allow destroying while moving, towering
  * list of blocks it's okay to destroy and tower with

# later
* fix test client scanArea, others
  * they shouldn't always be sending command results
* firefox
  * fix can't click inventory button
  * fix search catches wasd
* make electron skip login page
* make electron server disconnect users from normal browsers
* once we're confident electron works, change install scripts to download from release tag

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
* ocglasses roboserver client
  * highlight the block we're looking at
  * implement move command on punch first
  * create a way to select a tool in the overlay
  * implement the other tools
  * display contents of inventories when looking at them
  * use map data for x-ray vision?
* visual tool for chaining robot commands together to automate tasks
  * first make an action recording feature
  * specify number of loops, duration of sleep between

## small
* validate test data
* rework to use https://github.com/PrismarineJS/minecraft-data
* add a go away forever button to the message banner
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

