Messages are sent in JSON format and deserialized upon arrival. A message object has one key from a list here. The form of the value at that key isn't yet documented.

#### sent to web clients
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

#### sent to robots
(kind of in progress, need to move commandMap to the robot side)
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