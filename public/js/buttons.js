var buttonContainer = document.getElementById('buttonDiv');

/**
 * Adds a button to the web interface. When clicked, sends
 * a command to the listening robot to be executed.
 * @param {string} buttonID
 * @param {string} callback
 */
function addButton(buttonID, callback) {
  var button = document.getElementById(buttonID);
  button.addEventListener('click', callback);
};

var buttonCallbacks = {
   
  'scanButton': ()=>{sendCommand('scanArea', [document.getElementById('scanLevelSelect').value]);},

  'inventoryButton': ()=>{
    var inventoryContainer = document.getElementById('inventoryContainer');
    if (inventoryContainer.classList.contains('hidden')) {
      inventoryContainer.classList.remove('hidden');
      sendCommand('viewInventory');
    }
    else {
      inventoryContainer.classList.add('hidden');
    }
  },

  'equipButton': ()=>{sendCommand('equip');},

  'centerButton': ()=>{viewSelectedRobot();}

};

for (var buttonID in buttonCallbacks) {
  addButton(buttonID, buttonCallbacks[buttonID]);
}