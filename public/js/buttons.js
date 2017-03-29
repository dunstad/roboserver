var buttonContainer = document.getElementById('buttonContainer');

/**
 * Adds a button with text 'name' to the web interface. When clicked, sends
 * 'codeStringFunction' to the listening robot to be executed.
 * @param {string} name
 * @param {function(): string} codeStringFunction
 */
function addButton(name, codeStringFunction) {
  var button = document.createElement('button');
  button.innerHTML = name;
  button.addEventListener('click', ()=>{
    addMessage(codeStringFunction(), true);
    socket.emit('command', codeStringFunction());
  });
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(document.createElement('br'));
};

var scanSelect = document.getElementById('scanWhileMoving');
var codeStrings = {
  scanArea: ()=>{return 'for i=-1,7 do sendScan.plane(i); end return true;';},
  scanClose: ()=>{return 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;';},
  viewInventory: ()=>{return 'return int.sendInventoryData(-1);';},
  equip: ()=>{return 'local e = require("component").inventory_controller.equip(); int.sendInventoryData(-1); return e;';},
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
