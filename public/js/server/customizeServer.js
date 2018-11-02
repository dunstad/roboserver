var accounts = new (require('./SocketToAccountMap'))();

const delimiter = '\n';

/**
 * Starts the TCP server and adds event listeners to the HTTP server.
 * @param {object} server 
 */
function main(server, app) {

  // start http/socket.io server code

  var io = require('socket.io')(server);
  var config = require('../config/config');

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
      accounts.sendToRobot(socket.request.user.username, data.robot, data.command);
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
      JSON.stringify({name: 'message', parameters: ["hello, it's the tcp server!"]}) + delimiter
    );

  	// relay command results from robot to web server
  	tcpSocket.on('data', (data)=>{
      if (!tcpSocket.remainder) {tcpSocket.remainder = '';}
      const parsedTCP = parseTCPData(data.toString(), tcpSocket.remainder);
      console.log(parsedTCP);
      tcpSocket.remainder = parsedTCP.remainder;
      const dataJSONList = parsedTCP.messages.map(JSON.parse);

  		// separate tcp data into various messages
      for (var dataJSON of dataJSONList) {
        for (var key in dataJSON) {
          console.log(key, dataJSON[key]);
          if (key == 'id') {
            tcpSocket.id = dataJSON[key];
            if (accounts.getRobot(tcpSocket.id.account, tcpSocket.id.robot)) {
              var errorString = 'a robot called ' + tcpSocket.id.robot +
                ' is already connected to account ' + tcpSocket.id.account;
              disconnectRobot(tcpSocket, errorString);
            }
            else {
              accounts.setRobot(tcpSocket.id.account, tcpSocket.id.robot, tcpSocket);
              console.log("robot " + tcpSocket.id.robot + " identified for account " + tcpSocket.id.account);
            }
          }
          else if (tcpSocket.id && tcpSocket.id.account && tcpSocket.id.robot) {
            accounts.sendToClients(tcpSocket.id.account, key, {data: dataJSON[key], robot: tcpSocket.id.robot});
          }
          else {
            var errorString = 'unidentified robots cannot send messages';
            disconnectRobot(tcpSocket, errorString);
          }
        }
      }

    });

    /**
     * Used to piece together any tcp messages which got broken up,
     * and find any pieces we don't have the end of yet.
     * @param {string} tcpString 
     * @param {string} tcpRemainder 
     */
    function parseTCPData(tcpString, tcpRemainder) {
      console.log(tcpString);
      console.log(tcpRemainder);
      let completeMessages = [];
      const tcpMessageRegExp = new RegExp(`.+${delimiter}?`, 'g');
      const tcpMessages = tcpString.match(tcpMessageRegExp) || [];
      for (let tcpMessage of tcpMessages) {

        const assembledTCPMessage = tcpRemainder ? tcpRemainder + tcpMessage : tcpMessage;
        tcpRemainder = '';

        const containsDelimiter = assembledTCPMessage.indexOf(delimiter) != -1;
        if (!containsDelimiter) {
          tcpRemainder = assembledTCPMessage;
        }
        else {
          completeMessages.push(assembledTCPMessage);
        }

      }
      let result = {
        messages: completeMessages,
        remainder: tcpRemainder,
      };
      return result;
    }
    
    /**
     * Disconnects a robot without notifying the web client.
     * Used for unidentified robots and duplicate identifiers.
     * @param {object} robotSocket 
     * @param {string} errorString 
     */
    function disconnectRobot(robotSocket, errorString) {
      console.log(errorString);
      robotSocket.write(JSON.stringify({name: 'message', parameters: [errorString]}) + delimiter);
      robotSocket.endedByServer = true;
      robotSocket.end();
    }

    /**
     * Tells the web client a robot has disconnected.
     * @param {object} robotSocket 
     */
    function notifyOfDisconnect(robotSocket) {
      if (robotSocket.id) {
        accounts.setRobot(robotSocket.id.account, robotSocket.id.robot);
        accounts.sendToClients(robotSocket.id.account, "listen end", {robot: robotSocket.id.robot})
        console.log("robot " + robotSocket.id.robot + " for account " + robotSocket.id.account + " disconnected");
      }
    }

  	tcpSocket.on('error', (error)=>{
      console.dir(error);
      notifyOfDisconnect(tcpSocket);
    });

  	// Remove the client from the list when it leaves
  	tcpSocket.on('end', ()=>{
      if (!tcpSocket.endedByServer) {
        notifyOfDisconnect(tcpSocket);
      }
  	});

  	 tcpSocket.on('close', ()=>{console.log('closed');});

  }).listen(3001);

  // end tcp server code

}

module.exports = main;
