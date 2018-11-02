import {GUI} from '/js/client/GUI.mjs';
import {MapRender} from '/js/client/MapRender.mjs';

export class Game {

  /**
   * Used to connect the MapRender, GUI, and other things to each other.
   */
  constructor() {

    this.mapRender = new MapRender(this);
    this.GUI = new GUI(this);
    this.webClient = new WebClient(this);

  }

};