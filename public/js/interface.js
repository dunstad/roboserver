// socket connection to http server
var socket = io();
socket.on('message', console.dir);
socket.send('ping');

// display command results received from robot
socket.on('command result', (data)=>{
  console.dir(data);
});

// add functionality to command input field
var commandInput = document.getElementById('commandInput');
commandInput.addEventListener("change", (event)=>{
  sendCommand(event.target.value);

  // send command to the web server
  socket.emit('command', event.target.value);

  event.target.value = '';
});

function sendCommand(commandString) {
  commandJSON = JSON.stringify({command: commandString});
  console.dir(commandJSON);
}
