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

    var account = this.accounts[accountName];
    this.accounts[accountName] = account || {};
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

    var account = this.accounts[accountName];
    this.accounts[accountName] = account || {};
    account.robots = account.robots || {};

    account.robots[robotName] = robotSocket;
    result = true;

    return result;
  }

}
