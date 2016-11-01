var express = require('express');
var router = express.Router();

// main page where you enter commands
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
