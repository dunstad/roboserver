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
  forward: ()=>{return 'return mas.moveAndScan("forward", ' + scanSelect.value + ');';},
  back: ()=>{return 'return mas.moveAndScan("back", ' + scanSelect.value + ');';},
  up: ()=>{return 'return mas.moveAndScan("up", ' + scanSelect.value + ');';},
  down: ()=>{return 'return mas.moveAndScan("down", ' + scanSelect.value + ');';},
  turnLeft: ()=>{return 'orient.turnLeft(); return true;';},
  turnRight: ()=>{return 'orient.turnRight(); return true;';},
  viewInventory: ()=>{return 'inv.sendInventoryData(-1); return true;';},
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
