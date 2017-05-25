## Usage Tips

To see the controls and shortcuts available, press "?" (Shift + /)

All buttons and fields in the UI have helpful tooltips you can view by hovering the cursor over them.

Clicking on the screen will lock the cursor in place, allowing you to control the camera.

All commands are issued to the currently selected robot. Change which robot is selected with the dropdown in the top right.

### Tools

The five buttons in the Tools panel change what happens at your cursor location when you click while controlling the camera.

With the move tool selected, the robot will attempt to move to the highlighted point. This can fail if the movement is complex. If that happens, break the movement up into a few smaller ones.

With the interact tool selected, the robot will perform a right-click on the highlighted point using whatever tool the robot has equipped. This can be used for things like flipping levers and shearing sheep.

If you use the interact tool on a container such as a chest, its contents will be displayed to you, and you can put items in or take them out. Some blocks such as furnaces do not allow all displayed inventory slots to be used, and have different inventories depending on which side you access.

With the inspect tool selected, the robot will report in the command history panel exactly what is at the highlighted point.

The swing and place tools require you to select an area to operate on. With either of these tools selected, first click on one corner of the area you want to change. Next, click on the opposite corner of the area you want to change. Now you can either click a third time to finalize the area, or change it using the coordinate boxes on the right side of the screen. If you want to stop before finalizing, click a separate tool and your selection will be undone.

With the swing tool selected, the robot will perform a left click action with its equipped tool on every block in the specified area. This can be used for things like digging and attacking.

With the place tool selected, the robot will attempt to place the block in its selected inventory slot (not the equip slot) at every empty space in the specified area.

### Actions

The inventory button toggles the visibility of the robot's inventory. Closing and opening the inventory will update it.
Drag and drop an item stack to move it, and click on a slot to select it. 

The equip button exchanges the items in your selected slot and your equip slot.

The scan button reveals the area around the robot, with blocks colored by hardness. The scan size selector affects how large the scanned area will be. For slower computers, a large scan can be rather taxing, so use with care. A small scan will complete almost instantly, but you'll have to wait about 15 to 45 seconds for a large scan.

The center button will move the camera to be centered above the selected robot, looking down.

The list of items that can be crafted includes all items in Minecraft 1.11 and OpenComputers 1.6. It isn't yet possible to add your own recipes or change the existing ones.

The cutaway tool allows easy viewing of layers of ground that are obscured by the surface.

### Robot

Run `lua /home/lib/commandLoop.lua` to have the robot begin listening for commands from the web client.

If you want the robot to begin listening to the Roboserver every time it starts, add the above command to the end of ```/home/.shrc```.

Configuration settings for the robot are stored in ```/home/lib/config.txt```.

You can easily modify configuration settings using the following command: ```lua /home/lib/config.lua settingName settingValue```.

If you want to be able to send any Lua code to your robot from the web interface, run the following: ```lua /home/lib/config.lua components {raw=true}```. This will cause a command input field to appear in the command history panel when you have the configured robot selected.