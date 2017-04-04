/**
 * Starts the TCP server and adds event listeners to the HTTP server.
 * @param {object} server 
 */
function main(server, app) {

  // start http/socket.io server code

  var io = require('socket.io')(server);

  var session = require('express-session');
  var NedbStore = require('nedb-session-store')(session);
  app.set('sessionStore', new NedbStore({filename: 'sessions.db'}));

  var passportSocketIo = require('passport.socketio');
  io.use(passportSocketIo.authorize({
    store: app.get('sessionStore'),
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  }));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);
  if (error) {accept(new Error(message));}
}

  io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('message', (data)=>{
      console.log(data);
      socket.send('pong');
    });
    socket.on('disconnect', function () {
      console.log('a user disconnected');
    });

    // relay commands to the tcp server
    socket.on('command', (data)=>{
      console.dir(data);
      var commandJSON = JSON.stringify({command: data});
    	broadcast(commandJSON, clients);
    });

  });

  // end http/socket.io server code

  // start tcp server code

  /**
   * 
   * @param {string} message 
   * @param {object[]} clientList 
   */
  function broadcast(message, clientList) {
  	// Log it to the server output too
  	console.log(message);
  	console.log('total clients: ' + clientList.length);
  	clientList.forEach(function (client) {
      // newlines delimit messages
  		client.write(message + '\r\n');
  	});
    return clientList.length;
  }

  // maintain global list of clients for broadcasting
  var clients = [];

  // listen for tcp connections from robots
  var net = require('net');

  var tcpServer = net.createServer((tcpSocket)=>{

  	clients.push(tcpSocket);
  	console.log('client added. total clients: ' + clients.length);

    // test write
  	tcpSocket.write(
      JSON.stringify({message: "hello, it's the tcp server!"}) + '\r\n'
    );

  	// relay command results from robot to web server
  	tcpSocket.on('data', (data)=>{
  		var dataJSON = JSON.parse(data.toString());
  		console.dir(dataJSON);

  		// separate tcp data into various messages
  		for (key in dataJSON) {
  			console.log(key, dataJSON[key]);
  			io.emit(key, dataJSON[key]);
  		}

  	});

  	tcpSocket.on('error', console.log);

  	// Remove the client from the list when it leaves
  	tcpSocket.on('end', ()=>{
  		clients.splice(clients.indexOf(tcpSocket), 1);
  		console.log('client removed. total clients: ' + clients.length);
  	});

  	 tcpSocket.on('close', ()=>{console.log('closed');});

  }).listen(3001);

  // end http/socket.io server code

}

module.exports = main;
