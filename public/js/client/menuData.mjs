import { Menu } from '/js/client/Menu.mjs';

let blankTile = {
  imageString: '',
  onClick: function () {},
}

function makeMenuOpener(menuString) {
  return function () {
    this.menu.fadeOut();
    let menuPos = this.menu.menuPos;
    let lookPos = this.menu.lookPos;
    let wait = true;
    new Menu(menuPos, lookPos, menuData[menuString], this.menu.mapRender, wait);
  };
}

function makeTransitionTile(imageString, target) {
  let tile = {
    imageString: imageString,
    onClick: function () {console.log('placeholder')},
  };
  tile.onClick = makeMenuOpener(target);
  return tile;
}

// 'this' will be a Tile for these functions
// because they get rebound, they can't be arrow functions
let menuData = {
  main: [
    makeTransitionTile('add', 'three'),
    {
      imageString: 'remove',
      onClick: function () {this.menu.fadeOut();},
    },
  ],
  three: [
    makeTransitionTile('add', 'four'),
    blankTile,
    makeTransitionTile('remove', 'main'),
  ],
  four: [
    makeTransitionTile('add', 'five'),
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'three'),
  ],
  five: [
    makeTransitionTile('add', 'six'),
    blankTile,
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'four'),
  ],
  six: [
    makeTransitionTile('add', 'seven'),
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'five'),
  ],
  seven: [
    makeTransitionTile('add', 'eight'),
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'six'),
  ],
  eight: [
    makeTransitionTile('add', 'nine'),
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'seven'),
  ],
  nine: [
    {
      imageString: 'add',
      onClick: function () {console.log('add!');},
    },
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    blankTile,
    makeTransitionTile('remove', 'eight'),
  ],
};

export {menuData};