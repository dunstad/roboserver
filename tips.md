### Usage Tips

To see the controls and shortcuts available, press "?" (Shift + /)

Clicking on the screen will lock the cursor in place, allowing you to control the camera.

The five buttons in the Tools panel change what happens at your cursor location when you click while controlling the camera.

With the move tool selected, the robot will attempt to move to the highlighted point. This can fail if the movement is complex. If that happens, break the movement up into a few smaller ones.

With the interact tool selected, the robot will perform a right-click on the highlighted point using whatever tool the robot has equipped. This can be used for things like flipping levers and shearing sheep.

With the inspect tool selected, the robot will report in the command history panel exactly what is at the highlighted point.

The swing and place tools require you to select an area to operate on. With either of these tools selected, first click on one corner of the area you want to change. Next, click on the opposite corner of the area you want to change. Now you can either click a third time to finalize the area, or change it using the coordinate boxes on the right side of the screen. If you want to stop before finalizing, click a separate tool and your selection will be undone.

With the swing tool selected, the robot will perform a left click action with its equipped tool on every block in the specified area. This can be used for things like digging and attacking.

With the place tool selected, the robot will attempt to place the block in its selected inventory slot (not the equip slot) at every empty space in the specified area.

Run `lua /home/lib/commandLoop.lua` to have the robot begin listening for commands from the web client.

place uses selected slot, not equip slot