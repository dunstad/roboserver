var express = require('express');
var router = express.Router();

// main page where you enter commands
router.get('/', function(req, res) {
  res.render('index');
});

var minecraftRecipes = require("../public/js/minecraftRecipes.json");
var recipeSearch = require("../public/js/recipeSearch.js");


// allows robots to look up crafting recipes
router.get('/recipe/:recipeName', function(req, res) {
  var recipeName = req.params.recipeName;
  var recipes = recipeSearch.findRecipeFor(recipeName, minecraftRecipes);
  var productRecipes = recipes.map((recipe)=>{return recipeSearch.extractRecipeFor(recipeName, recipe);});
  res.send(productRecipes);
});

module.exports = router;
