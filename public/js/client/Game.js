class Game {

  /**
   * Used to connect the MapRender, GUI, and other things to each other.
   */
  constructor() {

    this.GUI = new GUI(this);
    this.MapRender = new MapRender(this);
    this.WebClient = new WebClient(this);

  }

}