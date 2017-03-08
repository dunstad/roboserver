var buttonContainer = document.getElementById('buttonContainer');

function addButton(name, codeString) {
  var button = document.createElement('button');
  button.innerHTML = name;
  button.addEventListener('click', ()=>{
    addMessage(codeString, true);
    socket.emit('command', codeString);
  });
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(document.createElement('br'));
};

var scanLevel = document.getElementById('scanWhileMoving').value;
var codeStrings = {
  scanArea: 'for i=-1,7 do sendScan.plane(i); end return true;',
  scanClose: 'for i=-2,3 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;',
  forward: 'return mas.moveAndScan("forward", '+ scanLevel +');',
  back: 'return mas.moveAndScan("back", '+ scanLevel +');',
  up: 'return mas.moveAndScan("up", '+ scanLevel +');',
  down: 'return mas.moveAndScan("down", '+ scanLevel +');',
  turnLeft: 'orient.turnLeft(); return true;',
  turnRight: 'orient.turnRight(); return true;',
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
