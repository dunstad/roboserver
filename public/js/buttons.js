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


var codeStrings = {
  scanArea: 'for i=-1,7 do sendScan.plane(i); end return true;',
  scanClose: 'for i=-2,3 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;',
  forwardScan: 'local p = pos.forward(); for i=-1,7 do scanDirection.forward(i); end return p;',
  forward: 'return pos.forward();',
  backScan: 'local p = pos.back(); for i=-1,7 do scanDirection.back(i); end return p;',
  back: 'return pos.back();',
  turnLeft: 'orient.turnLeft(); return true;',
  turnRight: 'orient.turnRight(); return true;',
  scanUp: 'local p = pos.up(); sendScan.plane(7); return p;',
  up: 'return pos.up();',
  scanDown: 'local p = pos.down(); sendScan.plane(-1); return p;',
  down: 'return pos.down();',
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
