module.exports = {

  host: '127.0.0.1',
  port: 3001,
  robotName: 'rob',
  accountName: 'admin',
  dimension: 'overworld',

  position: {
    x: 4,
    y: 4,
    z: 4,
  },

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
      },
      {
        side: -1,
        slotNum: 9,
        contents: {
          'damage': 0,
          'hasTag': false,
          'label': "Netherrack",
          'maxDamage': 0,
          'maxSize': 64,
          'name': "minecraft:netherrack",
          'size': 23
        }
      }
    ],
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
    ],
  },

  map: {
    [-2]: {
      0: {
        [-2]: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      }
    },
    [-1]: {
      0: {
        [-1]: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      }
    },
    0: {
      0: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      1: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      2: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
    },
    1: {
      0: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      1: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": 2.5,
          "name": "minecraft:chest",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      2: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
    },
    2: {
      0: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      1: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
      2: {
        0: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        1: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
        2: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      },
    },
    3: {
      0: {
        3: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      }
    },
    4: {
      0: {
        4: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      }
    },
    5: {
      0: {
        5: {
          "hardness": .5,
          "name": "minecraft:dirt",
        },
      }
    },
  },

  components: {
    raw: true,
  },
  
};