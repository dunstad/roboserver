/**
 * An organized way to store sockets and their account details.
 */
class SocketToAccountMap {

  /**
   * An organized way to store sockets and their account details.
   */
  constructor() {
    this.accounts = {};
  }


  getClients(accountName) {
    var result = [];
    
    var account = this.accounts[accountName];
    if (account && account.clients) {
      result = account.clients;
    }

    return result;
  }

  addClient(accountName, clientSocket) {
    var result = false;

    this.accounts[accountName] = this.accounts[accountName] || {};
    var account = this.accounts[accountName];
    account.clients = account.clients || [];
   
    account.clients.push(clientSocket);
    result = true;

    return result;
  }
  
  removeClient(accountName, clientSocket) {
    var result = false;
    var account = this.accounts[accountName];
    if (account && account.clients) {
      account.clients = account.clients.filter(socket => socket !== clientSocket);
      result = true;
    }
    return result;
  }

  sendToClients(accountName, eventName, data) {
    var result = false;
    this.getClients(accountName).forEach((clientSocket)=>{
      clientSocket.emit(eventName, data);
      result = true;
    });
    return result;
  }

  getRobot(accountName, robotName) {
    var result = undefined;
    
    var account = this.accounts[accountName];
    if (account && account.robots) {
      result = account.robots[robotName];
    }

    return result;
  }

  setRobot(accountName, robotName, robotSocket) {
    var result = undefined;

    this.accounts[accountName] = this.accounts[accountName] || {};
    var account = this.accounts[accountName];
    account.robots = account.robots || {};

    account.robots[robotName] = robotSocket;
    result = true;

    return result;
  }

  sendToRobot(accountName, robotName, eventName, data) {
    var result = false;
    var message = {};
    message[eventName] = data;
    var robotSocket = this.getRobot(accountName, robotName);
    if (robotSocket) {
      robotSocket.write(JSON.stringify(message) + '\r\n');
      result = true;
    }
    return result;
  }

}

try {
  module.exports = SocketToAccountMap;
}
catch(e) {;}