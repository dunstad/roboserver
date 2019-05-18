# 1.1
* packages.json needs updating on this branch, master is better

## ui
* the menu tile outline is barely visible
* make menu tiles that actually replace the HTML UI
* split command history by robot
* delete the message banner

# later

## item/building production
* rework to use https://github.com/PrismarineJS/minecraft-data
* all known inventories tracked per account, robots check those first when crafting or building
* current order of acting on an area of blocks not the most efficient
  * maybe do a column at a time but sort those by distance
  * alternatively sort all the points by distance after each action
* robots need to be able to find resources in the world
* use furnaces automatically during crafting
* management mode
  * each block of area-based tasks like digging and placing is a separate task
  * each item to be crafted is a separate task
  * tasks are sent one at a time to available robots
  * robots probably need to be able to lock resources like furnaces, possibly inventories

## item production
* customizable crafting recipes

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
