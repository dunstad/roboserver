if (!Ajv) {var Ajv = require("ajv")};
const ajv = Ajv({allErrors: true, $data: true});

const validators = {

  scanArea: ajv.compile({
    "properties": {
      "command": {
        "properties": {
          "name": {"type": "string"},
          "parameters": [
            
          ],
          "additionalProperties": false,   
        },
      },
      "robot": {"type": "string"},
      "additionalProperties": false,   
    },
  }),

};

try {
  module.exports = validators;
}
catch (e) {;}