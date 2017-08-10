if (!Ajv) {var Ajv = require("ajv")};
const ajv = Ajv({allErrors: true, $data: true});

const validators = {

  inventoryMeta: ajv.compile({
    "properties": {
      "size": {
        "type": "integer",
        "minimum": 1,
        "maximum": 64,
      },
      "side": {
        "type": "integer",
        "minimum": -1,
        "maximum": 5,
      },
      "selected": {
        "type": "integer",
        "minimum": 1,
        "maximum": {"$data": "1/size"},
      },
    },
    "required": ["size", "side"],
    "additionalProperties": false,
  }),

  inventorySlot: ajv.compile({
    "properties": {
      "side": {
        "type": "integer",
        "minimum": -1,
        "maximum": 5,
      },
      "slotNum": {
        "type": "integer",
        "minimum": 1,
        "maximum": 64,
      },
      "contents": {
        "properties": {
          "name": {"type": "string"},
          "label": {"type": "string"},
          "hasTag": {"type": "boolean"},
          "maxSize": {
            "type": "integer",
            "minimum": 1,
            "maximum": 64,
          },
          "size": {
            "type": "integer",
            "minimum": 1,
            "maximum": {"$data": "1/maxSize"},
          },
          "maxDamage": {
            "type": "integer",
            "minimum": 0,
          },
          "damage": {
            "type": "integer",
            "minimum": 0,
            "maximum": {"$data": "1/maxDamage"},
          },
        },
        "required": ["name", "label", "hasTag", "size", "maxSize", "damage", "maxDamage"],
      },
    },
    "required": ["side", "slotNum", "contents"],
    "additionalProperties": false,
  }),

  position: ajv.compile({
    "properties": {
      "x": {"type": "integer",},
      "y": {"type": "integer",},
      "z": {"type": "integer",},
    },
    "required": ["x", "y", "z"],
    "additionalProperties": false,
  }),

  components: ajv.compile({
    "properties": {
      "raw": {"type": "boolean",},
    },
    "additionalProperties": false,
  }),

};

try {
  module.exports = validators;
}
catch (e) {;}