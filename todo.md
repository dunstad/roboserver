* remember command
  * remember coordinates \[relative?\] \[name\] \[amount\]
    * store all names as lowercase
    * no name means inspect the block at the coords and remember that
      * unless it has an inventory, then remember the items?
      * doesn't work well for furnaces
    * no amount means it's a block
    * negative amounts mean subtract that many from what you remember
  * tells the server where items or blocks are
  * server should know the difference between items and blocks
  * server should know how many of an item are at a location
  
## experimental diegetic ui
* the menu tile outline is barely visible
* make menu tiles that actually replace the HTML UI
* split command history by robot
* delete the message banner

# 1.1

* locate command
  * locate name \[amount\]
    * store all names as lowercase
    * no amount means it's a block
  * check inventory first, then ask server
  * server replies with coordinates of an inventory or block
  * check location provided by server, update it, ask again if invalid
  * if the server doesn't know, craft it

* gather command, dig blocks matching gather list
  * just use equipped tool first
  * minecraft-data seems to provide harvestTools for blocks though

* build by specifying block name rather than using current slot
  * new parameters or a new command?

* add wander to movement for when pathing fails

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

## building production
* all known inventories tracked per account, robots check those first when crafting or building
* mapping:
  * Set up database
  * persistent server side maps that robots can read
  * dimension selector to handle robots in different dimensions or worlds
  * detect maximum scan batch size based on available memory
  * don't add to the scene any voxels which are surrounded?
  * merge and split voxel meshes based on distance from robot
    * sort of like how minecraft loads chunks, hopefully this approach would improve rendering speed
    * impossible to retain individual coloring?
* blueprints:
  * get them from some online source? or just have a bunch of base files on the server
  * create blueprint from selection
  * blueprint creator/editor



## usage from phone
* add phone controls
  * https://github.com/jeromeetienne/virtualjoystick.js


## other
* validate test data
* validate incoming data (outgoing is already validated)
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
* for vr, inventories should be shelves
  * each stack should have a model, sized by stack size
  * pick them up and move/throw them to different inventories

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
* find blocks feature (make non-matches mostly transparent)
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
* improve rendering color schemes
* make account registration create a new robot if server is on no-player mode
* set waypoints to account for complicated pathing
