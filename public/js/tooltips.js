main();

/**
 * Add tooltips to the UI.
 */
function main() {
  var tipMap = {
    'usernameDisplay': "Which user you're logged in as.",
    'cursorPositionDisplay': "The current position of the cursor.",
    'powerLevelDisplay': "The current power level of the selected robot.",
    'robotSelectDiv': "Which robot your commands will be sent to.",
    'moveButton': "Try to move to the clicked point.",
    'interactButton': "Try to right-click on the clicked point.",
    'inspectButton': "Try to see what block is at the selected point.",
    'swingButton': "Try to swing the equipped tool at every point in the selected area.",
    'placeButton': "Try to place blocks from the selected inventory slot at every point in the selected area.",
    'selectStartDiv': "Coordinates of the first corner of the selected area.",
    'selectEndDiv': "Coordinates of the second corner of the selected area.",
    'craftButton': "Try to craft the selected item.",
    'craftSelect': "Which item to craft. Currently only vanilla and OpenComputers items are available.",
    'inventoryButton': "Show or hide inventories.",
    'scanButton': "Get hardness data for an area around the selected robot. Affected by the scan size selector.",
    'equipButton': "Equip the item in the currently selected inventory slot.",
    'centerButton': "Move the camera above the selected robot and look down at it.",
    'axisButton': "Which axis to hide blocks on. X, Y, or Z.",
    'operationButton': "Whether blocks with a coordinate greater than or less than the input will be hidden.",
    'cutawayValue': "The coordinate at which blocks become hidden.",
    'scanSizeDiv': "The size of the area a robot should scan when moving. Also affects the Scan button.",
    'commandInput': "Enter Lua code the robot will try to run.",
    'runInTerminalDiv': "If checked, input will be run as a shell command. Useful for things like ls, cd, and cat.",
    'messageContainer': "A log of commands sent to and responses received from the robot. Commands can be sent again by clicking on them.",
  };

  for (elemID in tipMap) {
    var elem = document.getElementById(elemID);
    elem.title = tipMap[elemID];
  }
}