/**
 * An organized way to access how we want to cut away the map.
 */
class CutawayForm {

  /**
   * An organized way to access how we want to cut away the map.
   * @param {HTMLButtonElement} axisForm
   * @param {HTMLButtonElement} operationForm 
   * @param {HTMLInputElement} cutawayValueForm 
   */
  constructor(axisForm, operationForm, cutawayValueForm) {
    this.axis = axisForm;
    this.operation = operationForm;
    this.cutawayValue = cutawayValueForm;

    this.axis.states = ['X', 'Y', 'Z'];
    this.operation.states = ['>', '<'];

    var changeState = (e)=>{
      var button = e.target;
      var currentState = button.states.indexOf(button.textContent);
      var nextState = currentState == button.states.length - 1 ? 0 : currentState + 1;
      button.textContent = button.states[nextState];
    };

    this.axis.addEventListener('click', changeState);
    this.operation.addEventListener('click', changeState);

  }

  /**
   * Removes any values from the form.
   */
  clear() {
    this.cutawayValue.value = "";
  }

  /**
   * Used to re-render the cutaway when the form is interacted with.
   * @param {function} listener
   */
  addChangeListener(listener) {
    this.axis.addEventListener('click', listener);
    this.operation.addEventListener('click', listener);
    this.cutawayValue.addEventListener('input', listener);
  }

  /**
   * Lets us know whether a voxel should be displayed given the entered cutaway point.
   * @param {object} point
   * @returns {boolean}
   */
  shouldBeRendered(point) {
    var axisName = this.axis.textContent;
    var operationName = this.operation.textContent;
    var cutawayValue = parseInt(this.cutawayValue.value);
    var result = true;
    if (!isNaN(cutawayValue)) {
      var axisNameMap = {
        'X': 'x',
        'Y': 'y',
        'Z': 'z'
      }
      var coord = point.world()[axisNameMap[axisName]];
      console.log(coord)
      if (operationName == '>') {
        if (coord > cutawayValue) {
          result = false;
        }
      }
      else if (operationName == '<') {
        if (coord < cutawayValue) {
          result = false;
        }
      }
    }
    return result;
  }

}