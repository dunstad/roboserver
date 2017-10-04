class GUI {

  constructor() {

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

    

  }

}