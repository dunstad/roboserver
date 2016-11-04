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
  scanArea: 'for i=-1,7 do sendScan.plane(i); end',
  forwardScan: 'pos.forward(); for i=-1,7 do scanDirection.forward(i); end',
  forward: 'pos.forward();',
  backScan: 'pos.back(); for i=-1,7 do scanDirection.back(i); end',
  back: 'pos.back();',
  turnLeft: 'orient.turnLeft();',
  turnRight: 'orient.turnRight();',
  scanUp: 'pos.up(); sendScan.plane(7);',
  up: 'pos.up();',
  scanDown: 'pos.down(); sendScan.plane(-1);',
  down: 'pos.down();',
};

for (name in codeStrings) {
  addButton(name, codeStrings[name]);
}
