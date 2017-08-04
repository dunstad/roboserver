module.exports = {

  host: '127.0.0.1',
  port: 3001,
  robotName: 'rob',
  accountName: 'admin',
  dimension: 'overworld',

  internalInventory: {
    meta: {
      'size': 64,
      'side': -1,
      'selected': 1
    },
    slots: [
      {
        side: -1,
        slotNum: 1,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Dirt",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:dirt",
          'size': 64
        }
      },
      {
        side: -1,
        slotNum: 2,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Dirt",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:dirt",
          'size': 37
        }
      },
      {
        side: -1,
        slotNum: 5,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Stone",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:stone",
          'size': 3
        }
      },
      {
        side: -1,
        slotNum: 7,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Wooden Sword?",
          'maxDamage': 100,
          'maxSize': 1,
          'name': "minecraft:wooden_sword?",
          'size': 1
        }
      }
    ]
  },

  externalInventory: {
    meta: {
      'size': 27,
      'side': 3
    },
    slots: [
      {
        side: 3,
        slotNum: 1,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Dirt",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:dirt",
          'size': 4
        }
      },
      {
        side: 3,
        slotNum: 2,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Dirt",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:dirt",
          'size': 7
        }
      },
      {
        side: 3,
        slotNum: 5,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Stone",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:stone",
          'size': 25
        }
      }
    ]
  },

  scan: {
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
    }
  }
  
};