module.exports = {

  'listen start': {
    robot: 'rob',
  },

  'listen end': {
    robot: 'rob',
  },

  'command result': {
    robot: 'rob',
    data: [true, 'a test command result'],
  },

  'map data': {
    robot: 'rob',
    data: {
      x: 0,
      z: 0,
      y: 0,
      w: 3,
      d: 3,
      data: {
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 1,
        12: 1,
        13: 1,
        14: 0,
        15: 1,
        16: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 0,
        24: 1,
        25: 1,
        26: 1,
        27: 1,
        n: 27
      },
    },
  },


  'block data': {
    robot: 'rob',
    data: {
      name: 'minecraft:dirt',
      hardness: .5,
      point: {
        x: 2,
        y: 2,
        z: 2,
      },
    },
  },
  
  'robot position': {
    robot: 'rob',
    data: {
      x: 4,
      y: 4,
      z: 4,
    },
  },
  
  'delete selection': {
    robot: 'rob',
    data: 1,
  },
  
  'dig success': {
    robot: 'rob',
    data:  {
      x: 2,
      y: 2,
      z: 2,
    },
  },
  
  'inventory data': {
    robot: 'rob',
    data: {
      'size': 64,
      'side': -1,
      'selected': 1
    },
  },
  
  'slot data': {
    robot: 'rob',
    data: {
      side: -1,
      slotNum: 1,
      contents: {
        damage: 0,
        hasTag: false,
        label: 'Dirt',
        maxDamage: 0,
        maxSize: 64,
        name: 'minecraft:dirt',
        size: 64
      }
    },
  },
  
  'power level': {
    robot: 'rob',
    data: .5,
  },
  
  'available components': {
    robot: 'rob',
    data: {raw: true},
  },
  
};