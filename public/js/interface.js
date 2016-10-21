var commandInput = document.getElementById('commandInput');
commandInput.addEventListener("change", (event)=>{
  sendCommand(event.target.value);
  event.target.value = '';
});

function sendCommand(commandString) {
  commandJSON = JSON.stringify({command: commandString});
  console.dir(commandJSON);
  fetchPromise('/commands', {
    method: 'post',
    body: commandJSON,
    headers: {'Content-Type': 'application/json'}
  })
  .then(console.dir)
  .catch(console.dir);
}

var socket = io();
socket.on('message', console.dir);
socket.send('ping');
