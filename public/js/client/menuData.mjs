// 'this' will be a Tile for these functions
// because they get rebound, they can't be arrow functions
export let menuData = {
  main: [
    {
      imageString: 'add',
      onClick: function () {console.log('add!');},
    },
    {
      imageString: 'remove',
      onClick: function () {this.menu.fadeOut();},
    },
  ],
};