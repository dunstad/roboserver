if (!Ajv) {var Ajv = require('ajv')};
const ajv = Ajv({allErrors: true, $data: true});

const inventoryMetaSchema = {
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
};

const inventoryMetaValidator = ajv.compile(inventoryMetaSchema);

const validators = {
  inventoryMeta: inventoryMetaValidator,
};

try {
  module.exports = validators;
}
catch (e) {;}