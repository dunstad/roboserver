var express = require('express');
var router = express.Router();

var passport = require('passport');

var bcrypt = require('bcryptjs');

function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {next();} 
  else {res.redirect('/login');}
}


// main page where you enter commands
router.get('/', loggedIn, function(req, res) {
  res.render('index', {user: req.user});
});

// login and registration page
router.get('/login', function(req, res) {
  res.render('login.ejs', {error: false, active: 'login'});
});

function makeLogInOrRedirect(req, res, next) {
  return (err, user, info)=>{
    if (err) { return next(err); }
    if (!user) { return res.render('login.ejs', {error: 'Login failed.', active: 'login'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  };
}

router.post('/login', (req, res, next)=>{
  passport.authenticate('local', makeLogInOrRedirect(req, res, next))(req, res, next);
});

const saltRounds = 10;
router.post('/register', (req, res, next)=>{
  var db = req.app.get('db');
  bcrypt.hash(req.body.password, saltRounds).then((hash)=>{
    db.findOne({username: req.body.username}).then((doc)=>{
      console.log(req.body.username, doc)
      if (doc) {
        return res.render('login.ejs', {error: 'Username unavailable.', active: 'register'});
      }
      else {
        db.insert({username: req.body.username, passwordHash: hash}).then((newDoc)=>{
          passport.authenticate('local', makeLogInOrRedirect(req, res, next))(req, res, next);
        })
        .catch((err)=>{return next(err);});
      }
    })
    .catch((err)=>{return next(err);});
  })
  .catch((err)=>{return next(err);});
});

// allows robots to look up crafting recipes
var minecraftRecipes = require('../public/js/recipes/minecraftRecipes.json');
var OCRecipes = require('../public/js/recipes/OCRecipes.json');
var allRecipes = minecraftRecipes.concat(OCRecipes);
var recipeSearch = require('../public/js/shared/recipeSearch.js');

router.get('/recipe/:recipeName', function(req, res) {
  var recipeName = req.params.recipeName;
  var recipes = recipeSearch.findRecipeFor(recipeName, allRecipes);
  var productRecipes = recipes.map((recipe)=>{return recipeSearch.extractRecipeFor(recipeName, recipe);});
  res.send(productRecipes);
});

// allows robots to look up block hardness values
let minecraftData = require('minecraft-data')('1.12.2');
let namesToHardness = {};
for (let block of minecraftData.blocksArray) {
  namesToHardness[block.name] = block.hardness;
}

router.get('/namesToHardness', function(req, res) {
  res.send(namesToHardness);
});

router.get('/blockData/:blockName', function(req, res) {
  let blockName = req.params.blockName;
  let blockData = minecraftData.findItemOrBlockByName(blockName);
  res.send(blockData);
});

// let the web client see what version we're using
let version = require('../package').version;
router.get('/version', function(req, res) {
  res.send(version);
});

module.exports = router;
