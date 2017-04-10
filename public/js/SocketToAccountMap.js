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

  /**
   * Get all the web client sockets listening of a particular account name.
   * @param {string} accountName
   * @returns {object[]}
   */
  getClients(accountName) {
    var result = [];
    
    var account = this.accounts[accountName];
    if (account && account.clients) {
      result = account.clients;
    }

    return result;
  }

  /**
   * Adds a new web client socket to our list for a particular account.
   * @param {string} accountName 
   * @param {object} clientSocket
   * @returns {boolean}
   */
  addClient(accountName, clientSocket) {
    var result = false;

    this.accounts[accountName] = this.accounts[accountName] || {};
    var account = this.accounts[accountName];
    account.clients = account.clients || [];
   
    account.clients.push(clientSocket);
    result = true;

    return result;
  }
  
  /**
   * Gets rid of a web client socket from our list for a particular account.
   * @param {string} accountName 
   * @param {object} clientSocket
   * @returns {boolean}
   */
  removeClient(accountName, clientSocket) {
    var result = false;
    var account = this.accounts[accountName];
    if (account && account.clients) {
      account.clients = account.clients.filter(socket => socket !== clientSocket);
      result = true;
    }
    return result;
  }

  /**
   * Send something to all web clients listening for a particular account.
   * @param {string} accountName 
   * @param {string} eventName 
   * @param {object} data 
   * @returns {boolean}
   */
  sendToClients(accountName, eventName, data) {
    var result = false;
    this.getClients(accountName).forEach((clientSocket)=>{
      clientSocket.emit(eventName, data);
      result = true;
    });
    return result;
  }

  /**
   * Get the socket for a certain robot of a certain account.
   * @param {string} accountName 
   * @param {string} robotName 
   * @returns {object}
   */
  getRobot(accountName, robotName) {
    var result = undefined;
    
    var account = this.accounts[accountName];
    if (account && account.robots) {
      result = account.robots[robotName];
    }

    return result;
  }

  /**
   * Set the socket for a certain robot of a certain account.
   * @param {string} accountName 
   * @param {string} robotName 
   * @param {object} robotSocket 
   * @returns {boolean}
   */
  setRobot(accountName, robotName, robotSocket) {
    var result = undefined;

    this.accounts[accountName] = this.accounts[accountName] || {};
    var account = this.accounts[accountName];
    account.robots = account.robots || {};

    account.robots[robotName] = robotSocket;
    result = true;

    return result;
  }

  /**
   * Send some data to a specific robot of a specific account.
   * @param {string} accountName 
   * @param {string} robotName 
   * @param {string} eventName 
   * @param {object} data 
   * @returns {boolean}
   */
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