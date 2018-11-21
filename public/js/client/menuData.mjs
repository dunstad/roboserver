import { Menu } from '/js/client/Menu.mjs';

// 'this' will be a Tile for these functions
// because they get rebound, they can't be arrow functions
let menuData = {
  main: [
    {
      imageString: 'add',
      onClick: function () {console.log('placeholder')},
    },
    {
      imageString: 'remove',
      onClick: function () {this.menu.fadeOut();},
    },
  ],
  three: [
    {
      imageString: 'add',
      onClick: function () {console.log('add!');},
    },
    {
      imageString: '',
      onClick: function () {},
    },
    {
      imageString: 'remove',
      onClick: function () {console.log('placeholder')},
    },
  ],
};

function makeMenuOpener(menuString) {
  return function () {
    this.menu.fadeOut();
    let menuPos = this.menu.menuPos;
    let lookPos = this.menu.lookPos;
    let wait = true;
    new Menu(menuPos, lookPos, menuData[menuString], this.menu.mapRender, wait);
  };
}

menuData.main[0].onClick = makeMenuOpener('three');
menuData.three[2].onClick = makeMenuOpener('main');

export {menuData};