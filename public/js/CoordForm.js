/**
 * An organized way to access coordinates stored in number inputs.
 */
class CoordForm {

  /**
   * An organized way to access coordinates stored in number inputs.
   * @param {HTMLInputElement} xForm 
   * @param {HTMLInputElement} yForm 
   * @param {HTMLInputElement} zForm 
   */
  constructor(xForm, yForm, zForm) {
    this.x = xForm;
    this.y = yForm;
    this.z = zForm;
  }

  /**
   * Used to tell when no coordinates are entered.
   * @returns {boolean}
   */
  isEmpty() {
    var empty = false;
    if (!(this.x.value || this.y.value || this.z.value )) {
      empty = true;
    }
    return empty;
  }

  /**
   * Used to tell when all coordinates have been entered.
   * @returns {boolean}
   */
  isComplete() {
    var complete = false;
    if (this.x.value && this.y.value && this.z.value ) {
      complete = true;
    }
    return complete;
  }

  /**
   * Creates a Vector3 from the current form input.
   * @returns {object}
   */
  getVector() {
    return new THREE.Vector3(
      parseInt(this.x.value),
      parseInt(this.y.value),
      parseInt(this.z.value)
    ).multiplyScalar(50);
  }

  /**
   * Sets form inputs to the values in the provided vector.
   * @param {object} v 
   */
  setFromVector(v) {
    var worldVector = v.clone().divideScalar(50).round();
    this.x.value = worldVector.x;
    this.y.value = worldVector.y;
    this.z.value = worldVector.z;
  }

  /**
   * Removes any values from all fields of the form.
   */
  clear() {
    this.x.value = "";
    this.y.value = "";
    this.z.value = "";
  }

}