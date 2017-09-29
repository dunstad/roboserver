if (!Ajv) {var Ajv = require("ajv")};
const ajv = Ajv({allErrors: true, $data: true});

/**
 * Used to automate adding this outside bit to all command schemas
 * and adding their validator to module.exports.
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

/**
 * Used to make creating command schemas easier, since they're all very similar.
 * @param {string} name 
 * @param {string[]} parameters 
 */
function makeCommandSchema(name, parameters) {
  let schema = {
    "properties": {
      "name": {
        "type": "string",
        "pattern": `^${name}$`,
      },
      "parameters": {
        "type": "array",
        "items": parameters.map((s)=>{return {type: s}}),
        "additionalItems": false,
        "minItems": parameters.length,
        "maxItems": parameters.length,
      },
    },
    "additionalProperties": false,
    "required": ["name", "parameters"],
  };
  return schema;
}

const commandSchemas = {
  scanArea: ['integer'],
  viewInventory: [],
  equip: [],
  dig: Array(8).fill('integer'),
  place: Array(8).fill('integer'),
  move: Array(4).fill('integer'),
  interact: Array(4).fill('integer'),
  inspect: Array(4).fill('integer'),
  select: ['integer'],
  transfer: Array(5).fill('integer'),
  craft: ['string'],
  raw: ['string'],
  sendPosition: [],
  sendComponents: [],
}

const validators = {};

for (let id in commandSchemas) {
  let subSchema = makeCommandSchema(id, commandSchemas[id]);
  makeCommandValidator(ajv, subSchema, id, validators);
}
try {
  module.exports = validators;
}
catch (e) {;}