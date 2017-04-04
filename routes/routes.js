var express = require('express');
var router = express.Router();

var passport = require('passport');

var bcrypt = require('bcrypt');

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
  console.dir(req.app.get('db'))
  res.render('login.ejs', {error: false, active: 'login'});
});

function makeLogInOrRedirect(req, res, next) {
  return (err, user, info)=>{
    if (err) { return next(err); }
    if (!user) { return res.render('login.ejs', {error: "Login failed.", active: "login"}); }
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
        return res.render('login.ejs', {error: "Username unavailable.", active: "register"});
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

router.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});

// allows robots to look up crafting recipes
var minecraftRecipes = require("../public/js/minecraftRecipes.json");
var recipeSearch = require("../public/js/recipeSearch.js");

router.get('/recipe/:recipeName', function(req, res) {
  var recipeName = req.params.recipeName;
  var recipes = recipeSearch.findRecipeFor(recipeName, minecraftRecipes);
  var productRecipes = recipes.map((recipe)=>{return recipeSearch.extractRecipeFor(recipeName, recipe);});
  res.send(productRecipes);
});

module.exports = router;