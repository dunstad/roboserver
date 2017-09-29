if (!Ajv) {var Ajv = require("ajv")};
const ajv = Ajv({allErrors: true, $data: true});

/**
 * 
 * @param {object} ajv 
 * @param {object} innerSchema 
 * @param {string} id
 * @return {object}
 */
function makeCommandValidator(ajv, innerSchema, id, validators) {

  ajv.addSchema(innerSchema, id);

  let schema = {
    "properties": {
      "command": {"$ref": id},
      "robot": {"type": "string"},
    },
    "additionalProperties": false,
    "required": ["command", "robot"],
  };

  let result = ajv.compile(schema);

  validators[id] = result;

  return result;

}

const commandSchemas = {

  scanArea: {
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
  },
  
}

const validators = {};

for (let id in commandSchemas) {
  makeCommandValidator(ajv, commandSchemas[id], id, validators);
}
try {
  module.exports = validators;
}
catch (e) {;}