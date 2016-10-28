var express = require('express');
var router = express.Router();

router.get('/map', function(req, res, next) {
  res.render('map');
});

// main page where you enter commands
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
