class GUI {

  constructor(game) {

    this.game = game;

    this.selections = {};

    this.selectStart = new CoordForm(
      document.getElementById('selectStartX'),
      document.getElementById('selectStartY'),
      document.getElementById('selectStartZ')
    );

    this.selectEnd = new CoordForm(
      document.getElementById('selectEndX'),
      document.getElementById('selectEndY'),
      document.getElementById('selectEndZ')
    );

    this.cutawayForm = new CutawayForm(
      document.getElementById('axisButton'),
      document.getElementById('operationButton'),
      document.getElementById('cutawayValue')
    );

    this.container = document.createElement('div');

    document.addEventListener('keydown', (e)=>{
      const questionMarkCode = 191;      
      if (e.keyCode == questionMarkCode && e.shiftKey) {e.preventDefault(); $('#controlsDisplay').modal('toggle');}
    });

    // stop key events triggering inside text fields
    Array.from(document.querySelectorAll('input[type=text]')).map((elem)=>{
      elem.addEventListener('keydown', (e)=>{e.stopPropagation();});
    });

    this.selectStart.addEventListener('input', ()=>{this.game.mapRender.removeSelectBox(); this.game.mapRender.requestRender()});
    this.selectEnd.addEventListener('input', ()=>{this.game.mapRender.removeSelectBox(); this.game.mapRender.requestRender()});
  
    let toolButtonListeners = [
      {buttonID: 'moveTool', eventListener: this.clearSelection},
      {buttonID: 'interactTool', eventListener: this.clearSelection},
      {buttonID: 'inspectTool', eventListener: this.clearSelection},
      {buttonID: 'digTool', eventListener: ()=>{this.clearSelection(); this.slowRender();}},
      {buttonID: 'placeTool', eventListener: ()=>{this.clearSelection(); this.slowRender();}}
    ];
  
    for (let toolButtonInfo of toolButtonListeners) {
      let button = document.getElementById(toolButtonInfo.buttonID).parentElement;
      button.addEventListener('click', toolButtonInfo.eventListener);
    }
  
    this.initPointerLock();
    this.initCommandInput();
    this.initClickTools();
    this.initSelectAreaTools();
    this.initCraftSelect();
    this.initRobotSelect();
    this.initCutawayForm();
    this.initModal();

  }

  /**
   * Serializes objects to Lua tables. Makes sending commands to robots easier.
   * @param {object} object 
   * @returns {string}
   */
  objectToLuaString(object) {
    let luaString = '{';
    for (let prop in object) {
      if (object.hasOwnProperty(prop)) {
        luaString = luaString + prop + '=' + object[prop] + ',';
      }
    }
    luaString = luaString + '}';
    return luaString;
  }

  /**
   * Stores a selection so it can be shown until the task it's for is completed.
   * @param {object} selections 
   * @param {THREE.Mesh} selection 
   * @returns {number}
   */
  addSelection(selections, selection) {
    this.game.mapRender.removeSelectBox();
    let counter = 0;
    while (this.selections[counter]) {counter++;}
    this.selections[counter] = selection;
    return counter;
  }
  
  /**
   * Used to get rid of a selection when the task it's for is completed.
   * @param {object} selections 
   * @param {number} index 
   */
  deleteSelection(selections, index) {
    let selection = this.selections[index];
    this.scene.remove(selection);
    selection.geometry.dispose();
    delete this.selections[index];
    this.requestRender();
  }

}