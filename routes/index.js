var express = require('express');
var router = express.Router();

var commands = [];
var map = [];

// render posted map data
router.get('/map', function(req, res, next) {
  res.render('map', {map: map});
});

// add more data to the current map
router.post('/map', function(req, res, next) {
  map = (JSON.parse(req.body.map));
  res.sendStatus(200);
});

// main page where you enter commands
router.get('/', function(req, res, next) {
  res.render('index');
});

// respond with currently pending commands
router.get('/commands', function(req, res, next) {
  res.send(commands);
  commands = [];
});

// add new pending command
router.post('/commands', function(req, res, next) {
  commands.push(req.body.command);
  res.sendStatus(200);
});


module.exports = router;
