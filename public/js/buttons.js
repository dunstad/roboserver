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
  forward: 'return pos.forward();',
  back: 'return pos.back();',
  up: 'return pos.up();',
  down: 'return pos.down();',
  turnLeft: 'orient.turnLeft(); return true;',
  turnRight: 'orient.turnRight(); return true;',
  forwardScanBig: 'local p = pos.forward(); for i=-1,7 do scanDirection.forwardBig(i); end return p;',
  backScanBig: 'local p = pos.back(); for i=-1,7 do scanDirection.backBig(i); end return p;',
  forwardScanSmall: 'local p = pos.forward(); scanDirection.forwardSmall(); return p;',
  backScanSmall: 'local p = pos.back(); scanDirection.backSmall(); return p;',
  scanUp: 'local p = pos.up(); sendScan.plane(7); return p;',
  scanDown: 'local p = pos.down(); sendScan.plane(-1); return p;',
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
