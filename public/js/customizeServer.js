var accounts = new (require('./SocketToAccountMap'))();

/**
 * Starts the TCP server and adds event listeners to the HTTP server.
 * @param {object} server 
 */
function main(server, app) {

  // start http/socket.io server code

  var io = require('socket.io')(server);
  var config = require('./config');

  var passportSocketIo = require('passport.socketio');
  io.use(passportSocketIo.authorize({
    store: app.get('sessionStore'),
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
    secret: config.expressSessionSecret
  }));

  function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');
    console.dir(data.user)
    accept();
  }

  function onAuthorizeFail(data, message, error, accept){
    console.log('failed connection to socket.io:', message);
    if (error) {throw new Error(message);}
    else {accept(new Error(message));}
  }

  io.on('connection', function (socket) {

    accounts.addClient(socket.request.user.username, socket);
    console.log(socket.request.user.username + " account connected");

    socket.on('message', (data)=>{
      console.log(data);
      socket.send('pong');
    });
    socket.on('disconnect', function () {
      accounts.removeClient(socket.request.user.username, socket);
      console.log(socket.request.user.username + " account disconnected");
    });

    // relay commands to the tcp server
    socket.on('command', (data)=>{
      console.dir(data);
      accounts.sendToRobot(socket.request.user.username, "rob", "command", data);
    });

  });

  // end http/socket.io server code

  // start tcp server code

  // listen for tcp connections from robots
  var net = require('net');

  var tcpServer = net.createServer((tcpSocket)=>{

  	console.log("unidentified robot connected");

    // test write
  	tcpSocket.write(
      JSON.stringify({message: "hello, it's the tcp server!"}) + '\r\n'
    );

  	// relay command results from robot to web server
  	tcpSocket.on('data', (data)=>{
  		var dataJSONList = data.toString().split('\r\n').filter(item=>item).map(JSON.parse);

  		// separate tcp data into various messages
      for (dataJSON of dataJSONList) {
        for (key in dataJSON) {
          console.log(key, dataJSON[key]);
          if (key == 'id') {
            tcpSocket.id = dataJSON[key];
            accounts.setRobot(tcpSocket.id.account, tcpSocket.id.robot, tcpSocket);
            console.log("robot " + tcpSocket.id.robot + " identified for account " + tcpSocket.id.account);
          }
          else if (tcpSocket.id && tcpSocket.id.account && tcpSocket.id.robot) {
            accounts.sendToClients(tcpSocket.id.account, key, dataJSON[key]);
          }
          else {
            var errorString = 'unidentified robots cannot send messages';
            console.log(errorString);
            tcpSocket.write(JSON.stringify({message: errorString}) + '\r\n');
          }
        }
      }

  	});

  	tcpSocket.on('error', console.log);

  	// Remove the client from the list when it leaves
  	tcpSocket.on('end', ()=>{
      if (tcpSocket.id) {
        accounts.setRobot(tcpSocket.id.account, tcpSocket.id.robot);
        console.log("robot " + tcpSocket.id.robot + " for account " + tcpSocket.id.account + " disconnected");
      }
  	});

  	 tcpSocket.on('close', ()=>{console.log('closed');});

  }).listen(3001);

  // end tcp server code

}

module.exports = main;
