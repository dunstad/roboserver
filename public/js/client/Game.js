class Game {

  /**
   * Used to connect the MapRender, GUI, and other things to each other.
   */
  constructor() {

    this.mapRender = new MapRender(this);
    this.GUI = new GUI(this);
    this.webClient = new WebClient(this);

  }

}