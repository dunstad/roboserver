Messages are sent in JSON format and deserialized upon arrival. A message object has one key from a list here. The form of the value at that key is contained in the schemas for [messages from robots](../public/js/shared/fromRobotSchemas.js) and [messages from web clients](../public/js/shared/fromClientSchemas.js).

### sent from robot to server
* message
* command result
* map data
* block data
* robot position
* delete selection
* dig success
* inventory data
* slot data
* listen start
* listen end
* power level
* available components

### sent from web client to server

#### format
```
{
  command: {
    name: "commandName",
    parameters: [param1, param2, ...],
    robot: "robotName"
  }
}
```

#### command names
* scanArea
* viewInventory
* equip
* dig
* place
* move
* interact
* inspect
* select
* transfer
* craft
* raw
* new ones needed for the protocol change
  * sendPosition
  * sendComponents