Messages are sent in JSON format, using either raw TCP with a \n delimiter or WebSockets. A message object has one key from a list here. The form of the value at that key is described in the schemas for [messages from robots](../public/js/shared/fromRobotSchemas.js) and [messages from web clients](../public/js/shared/fromClientSchemas.js), but here are some easier to read examples.

### sent from robot to server
* message
```
{
  "message": "Hello, World!"
}
```

* command result
```
{
  "command result": [false, "position already occupied"]
}
```

* map data
```
{
  "map data": {
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
      10: 2,
      11: .6,
      12: 1,
      13: 1,
      14: 0,
      15: 1,
      16: -1,
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
}
```

* block data
```
{
  "block data": {
    name: 'minecraft:dirt',
    hardness: .5,
    point: {
      x: 2,
      y: 2,
      z: 2,
    }
  }
}
```

* robot position
```
{
  "robot position": {
    x: 4,
    y: 4,
    z: 4,
  }
}
```

* delete selection
```
{
  "delete selection": 1
}
```

* dig success
```
{
  "dig success": {
    x: 2,
    y: 2,
    z: 2,
  }
}
```

* inventory data
```
{
  "inventory data": {
    'size': 64,
    'side': -1,
    'selected': 1
  }
}
```

* slot data
```
{
  "slot data": {
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
    }
  }
}
```

* power level
```
{
  "power level": .678
}
```

* available components
```
{
  "available components": {raw: false}
}
```


### sent from web client to server
* scanArea
```
{
  "command": {
    "name": "scanArea",
    "parameters": [1]
  },
  "robot": "rob"
}
```

* viewInventory
```
{
  "command": {
    "name": "viewInventory",
    "parameters": []
  },
  "robot": "rob"
}
```

* equip
```
{
  "command": {
    "name": "equip",
    "parameters": []
  },
  "robot": "rob"
}
```

* dig
```
{
  "command": {
    "name": "dig",
    "parameters": [1, 2, 3, 4, 5, 6, 1, 1]
  },
  "robot": "rob"
}
```

* place
```
{
  "command": {
    "name": "place",
    "parameters": [1, 2, 3, 4, 5, 6, 1, 1]
  },
  "robot": "rob"
}
```

* move
```
{
  "command": {
    "name": "move",
    "parameters": [1, 2, 3, 1]
  },
  "robot": "rob"
}
```

* interact
```
{
  "command": {
    "name": "interact",
    "parameters": [1, 2, 3, 1]
  },
  "robot": "rob"
}
```

* inspect
```
{
  "command": {
    "name": "inspect",
    "parameters": [1, 2, 3, 1]
  },
  "robot": "rob"
}
```

* select
```
{
  "command": {
    "name": "select",
    "parameters": [7]
  },
  "robot": "rob"
}
```

* transfer
```
{
  "command": {
    "name": "transfer",
    "parameters": [1, -1, 2, 3, 63]
  },
  "robot": "rob"
}
```

* craft
```
{
  "command": {
    "name": "craft",
    "parameters": ["Wooden Sword"]
  },
  "robot": "rob"
}
```

* raw
```
{
  "command": {
    "name": "raw",
    "parameters": ["print('Hello, World!');"]
  },
  "robot": "rob"
}
```

* sendPosition
```
{
  "command": {
    "name": "sendPosition",
    "parameters": []
  },
  "robot": "rob"
}
```

* sendComponents
```
{
  "command": {
    "name": "sendComponents",
    "parameters": []
  },
  "robot": "rob"
}
```