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

  }

}