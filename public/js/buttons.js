var buttonContainer = document.getElementById('buttonDiv');

/**
 * Adds a button to the web interface. When clicked, sends
 * a command to the listening robot to be executed.
 * @param {string} buttonName
 * @param {string} callback
 */
function addButton(buttonName, callback) {
  var button = document.createElement('button');
  button.innerHTML = buttonName;
  button.addEventListener('click', callback);
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(document.createElement('br'));
};

var buttonCallbacks = {
   
  'Scan Area': ()=>{sendCommand('scanArea', [document.getElementById('scanLevelSelect').value]);},

  'Show/Hide Inventory': ()=>{
    var inventoryContainer = document.getElementById('inventoryContainer');
    if (inventoryContainer.classList.contains('hidden')) {
      inventoryContainer.classList.remove('hidden');
      sendCommand('viewInventory');
    }
    else {
      inventoryContainer.classList.add('hidden');
    }
  },

  'Equip': ()=>{sendCommand('equip');},

  'Center Camera On Robot': ()=>{viewSelectedRobot();}

};

for (var buttonName in buttonCallbacks) {
  addButton(buttonName, buttonCallbacks[buttonName]);
}