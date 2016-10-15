var express = require('express');
var router = express.Router();

var commands = [];

// test page
router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Test!' });
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
