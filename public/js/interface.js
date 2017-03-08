// socket connection to http server
var socket = io();
socket.on('message', console.dir);
socket.send('ping');

// display command results received from robot
socket.on('command result', (data)=>{
  console.dir(data);
  addMessage(data, false);
});

// render map data received from robot
socket.on('map data', (data)=>{
  console.dir(data);
  addShapeVoxels(data);
});

// render map data received from robot
socket.on('robot position', (pos)=>{
  console.dir(pos);
  moveRobotVoxel(pos);
});

// add functionality to command input field
var commandInput = document.getElementById('commandInput');
commandInput.addEventListener("keypress", (event)=>{
  var runInTerminal = document.getElementById('runInTerminal');
  if (event.keyCode == 13) { // enter
    event.preventDefault();
    var baseText = event.target.value;
    var commandText = baseText;
    if (runInTerminal.checked) {
      commandText = "runInTerminal('" + commandText + "')";
    }
    commandText = "return " + commandText;

    // display command
    addMessage(baseText, true, runInTerminal.checked);

    // send command to the web server
    socket.emit('command', commandText);

    // clear input text
    event.target.value = '';
  }
  else if (event.keyCode == 9) { // tab
    event.preventDefault();
    runInTerminal.checked = !runInTerminal.checked;
  }
});

function addMessage(data, isInput, checked) {

  var element = document.createElement('div');
  element.classList.add('message');

  if (isInput) {
    var subClass = 'input';
    element.setAttribute("data-checked", checked);

    element.addEventListener('click', (event)=>{

      var commandInput = document.getElementById('commandInput');
      commandInput.value = event.target.firstChild.textContent;
      commandInput.focus();

      var checkData = event.target.getAttribute("data-checked");
      var wasChecked = checkData == "true" ? true : false;
      var runInTerminal = document.getElementById("runInTerminal");
      runInTerminal.checked = wasChecked;

    });

    element.appendChild(document.createTextNode(data));
  }

  else {
    var subClass = 'output';
    element.appendChild(renderCommandResponse(data));
  }

  element.classList.add(subClass);
  document.getElementById('messageContainer').insertBefore(element, commandInput);
  document.getElementById('messageContainer').insertBefore(document.createElement('br'), commandInput);

}

function renderCommandResponse(data) {
  var outputMessageDiv = document.createElement('div');
  var text = data[0] + '\n' + data[1];
  for (line of text.split('\n')) {
    outputMessageDiv.appendChild(document.createTextNode(line));
    outputMessageDiv.appendChild(document.createElement('br'));
  }
  outputMessageDiv.lastChild.remove();
  return outputMessageDiv;
}
