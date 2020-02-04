module.exports = {

  dimension: 'overworld',

  config: {
    robotName: 'rob',
    accountName: 'admin',
    serverIP: '127.0.0.1',
    serverPort: 8080,
    tcpPort: 3001,
    posX: 4,
    posY: 4,
    posZ: 4,
    orient: 0,
    raw: true,
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
    '0c9a47e1-d211-4d73-ad9d-f3f88a6d0ee9': 'keyboard',
    '25945f78-9f94-4bd5-9211-cb37b352ebf7': 'filesystem',
    '2a2da751-3baa-4feb-9fa1-df76016ff390': 'inventory_controller',
    '5d48c968-e6f5-474e-865f-524e803678a7': 'filesystem',
    '5f6a65bd-98c1-4cf5-bbe5-3e0b8b23662d': 'internet',
    '5fffe6b3-e619-4f4f-bc9f-3ddb028afe02': 'filesystem',
    '73aedc53-517d-4844-9cb2-645c8d7667fc': 'screen',
    '8be5872b-9a01-4403-b853-d88fe6f17fc3': 'eeprom',
    '9d40d271-718e-45cc-9522-dc562320a78b': 'crafting',
    'c8181ac9-9cc2-408e-b214-3acbce9fe1c6': 'chunkloader',
    'c8fe2fde-acb0-4188-86ef-4340de011e25': 'robot',
    'ce229fd1-d63d-4778-9579-33f05fd6af9a': 'gpu',
    'fdc85abb-316d-4aca-a1be-b7f947016ba1': 'computer',
    'ff1699a6-ae72-4f74-bf1c-88ac6901d56e': 'geolyzer'
  },
  
};