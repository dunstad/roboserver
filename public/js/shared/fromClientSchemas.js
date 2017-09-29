if (!Ajv) {var Ajv = require("ajv")};
const ajv = Ajv({allErrors: true, $data: true});


function makeCommandValidator() {

}

let scanArea = {
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^scanArea$",
    },
    "parameters": {
      "type": "array",
      "items": [{ "type": "integer"}],
      "additionalItems": false,
      "minItems": 1,
      "maxItems": 1,
    },
  },
  "additionalProperties": false,
  "required": ["name", "parameters"],
}

ajv.addSchema(scanArea, 'scanArea');

const validators = {

  scanArea: ajv.compile({
    "properties": {
      "command": {"$ref": "scanArea#/"},
      "robot": {"type": "string"},
    },
    "additionalProperties": false,
    "required": ["command", "robot"],
  }),

};

try {
  module.exports = validators;
}
catch (e) {;}