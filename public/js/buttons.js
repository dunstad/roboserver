var buttonContainer = document.getElementById('buttonDiv');

/**
 * Adds a button to the web interface. When clicked, sends
 * a command to the listening robot to be executed.
 * @param {string} buttonName
 * @param {string} commandName
 */
function addButton(buttonName, commandName) {
  var button = document.createElement('button');
  button.innerHTML = buttonName;
  button.addEventListener('click', ()=>{
    sendCommand(commandName);
  });
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(document.createElement('br'));
};

var codeStrings = {
   'Scan Far': 'scanArea',
   'Scan Near': 'scanClose',
   'Refresh Inventory': 'viewInventory',
   'Equip': 'equip',
};

for (var buttonName in codeStrings) {
  addButton(buttonName, codeStrings[buttonName]);
}
