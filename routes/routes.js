var express = require('express');
var router = express.Router();

var passport = require('passport');

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {next();} 
    else {res.redirect('/login');}
}


// main page where you enter commands
router.get('/', loggedIn, function(req, res) {
  res.render('index', {user: req.user});
});

// login and registration page
router.get('/login', function(req, res, next) {
  res.render('login.ejs', {error: false});
});

router.post('/login', (req, res, next)=>{
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('login.ejs', {error: "Login failed."}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next)
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
