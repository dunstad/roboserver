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

  geolyzerScan: ajv.compile({
    "properties": {
      "x": {"type": "integer",},
      "y": {"type": "integer",},
      "z": {"type": "integer",},
      "w": {"type": "integer",},
      "d": {"type": "integer",},
      "data": {
        "patternProperties": {
          /*
          i'm not going to try to make a regex that only
          matches numbers up to n, so this schema does
          validate some things which are not correct.
          */
          "\\d+": {"type": "number"}
        },
        "properties": {
          "n": {"type": "integer"}
        },
        "required": ["n"],
        "additionalProperties": false,
      },
    },
    "required": ["x", "y", "z", "w", "d", "data"],
    "additionalProperties": false,
  }),

  components: ajv.compile({
    "patternProperties": {
      "^.*$": {"type": "string",},
    },
    "additionalProperties": false,
  }),

  config: ajv.compile({
    "properties": {
      "robotName": {"type": "string"},
      "accountName": {"type": "string"},
      "serverIP": {"type": "string"},
      "serverPort": {"type": "integer"},
      "tcpPort": {"type": "integer"},
      "posX": {"type": "integer"},
      "posY": {"type": "integer"},
      "posZ": {"type": "integer"},
      "orient": {"type": "integer"},
      "raw": {"type": "boolean",},
    },
    "additionalProperties": false,
  }),
  
  commandResult: ajv.compile({
    "type": "array",
    "items": [
      { "type": "string" },
      { "type": ["boolean", "string"] },
    ],
    "additionalItems": false,
    "minItems": 2,
    "maxItems": 2,
  }),
  
  id: ajv.compile({
    "properties": {
      "robot": {"type": "string",},
      "account": {"type": "string",},
    },
    "additionalProperties": false,
    "required": ["robot", "account"],
  }),

  powerLevel: ajv.compile({
    "type": "number",
    "minimum": 0,
    "maximum": 1,
  }),

  message: ajv.compile({
    "type": "string",
  }),

  digSuccess: ajv.compile({
    "properties": {
      "x": {"type": "integer",},
      "y": {"type": "integer",},
      "z": {"type": "integer",},
    },
    "required": ["x", "y", "z"],
    "additionalProperties": false,
  }),

  deleteSelection: ajv.compile({
    "type": "integer",
  }),

  blockData: ajv.compile({
    "properties": {
      "name": {"type": "string",},
      "hardness": {"type": "number",},
      "point": {
        "properties": {
          "x": {"type": "integer",},
          "y": {"type": "integer",},
          "z": {"type": "integer",},
        },
        "required": ["x", "y", "z"],
        "additionalProperties": false,
      },
    },
    "required": ["name", "hardness", "point"],
  }),

};

const keyToValidatorMap = {
  'inventory data': validators.inventoryMeta,
  'slot data': validators.inventorySlot,
  'command result': validators.commandResult,
  'robot position': validators.position,
  'available components': validators.components,
  'map data': validators.geolyzerScan,
  'id': validators.id,
  'message': validators.message,
  'power level': validators.powerLevel,
  'dig success': validators.digSuccess,
  'delete selection': validators.deleteSelection,
  'block data': validators.blockData,
  'config': validators.config,
};

try {
  module.exports = {
    validators: validators,
    keyToValidatorMap: keyToValidatorMap,
  };
}
catch (e) {;}