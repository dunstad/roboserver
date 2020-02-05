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
 * Used to determine minimum array size by counting optional arguments.
 * @param {Array[]} typeList 
 */
function countNull(typeList) {
  return typeList.reduce((a, b)=>{return a + (b.indexOf('null')!=-1)}, 0);
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
        "additionalItems": false,
        "minItems": 0,
        "maxItems": 0,
      },
    },
    "additionalProperties": false,
    "required": ["name", "parameters"],
  };

  if (parameters.length) {
    schema.properties.parameters = {
      "type": "array",
      "items": parameters.map((s)=>{return {type: s}}),
      "additionalItems": false,
      "minItems": parameters.length - countNull(parameters),
      "maxItems": parameters.length,
    };
  }

  return schema;
}

let doToAreaParams = Array(6).fill('integer').concat([['boolean', 'null']]).concat(Array(2).fill(['integer', 'null']));
let moveParams = Array(3).fill('integer').concat([['boolean', 'null'], ['integer', 'null']]);

const commandSchemas = {
  scanArea: ['integer', ['integer', 'null']],
  viewInventory: [],
  equip: [],
  dig: doToAreaParams,
  place: doToAreaParams,
  move: moveParams,
  interact: moveParams,
  inspect: moveParams,
  select: ['integer'],
  transfer: Array(5).fill('integer'),
  craft: ['string'],
  raw: ['string'],
  sendPosition: [],
  sendComponents: [],
  config: [['string', 'null'], ['string', 'integer', 'boolean', 'null']],
  remember: moveParams,
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