function getRecipeNames(recipe) {
  var recipeNames = [];
  for (var output of recipe.out) {
    for (var item of output) {
      if (recipeNames.indexOf(item.product) == -1) {
        recipeNames.push(item.product);
      }
    }
  }
  return recipeNames;
}

function findRecipeFor(product, recipes) {
  var recipesForProduct = [];
  for (var recipe of recipes) {
    var recipeProducts = getRecipeNames(recipe);
    if (recipeProducts.indexOf(product) != -1) {
      recipesForProduct.push(recipe);
    }
  }
  return recipesForProduct;
}

function extractRecipeFor(product, recipe) {
  if (recipe.out.length == 1) {
    var productRecipe = recipe;
  }
  else {
    var indexToCraftingSlotMap = [1, 2, 3, 5, 6, 7, 9, 10, 11];
    var productRecipe = {"in":{}, "out":[]};

    var productIndex;
    for (var i = 0; i < recipe.out.length; i++) {
      var outputName = recipe.out[i][0].product;
      if (outputName == product) {
        productIndex = i;
      }
    }
    if (productIndex === undefined) {productRecipe = false;}
    else {
      for (var slot in recipe.in) {
        if (recipe.in[slot].length == recipe.out.length) {
          productRecipe.in[slot] = recipe.in[slot][productIndex].map(item=>[item]);
        }
        else {
          productRecipe.in[slot] = [recipe.in[slot][0]];
        }
      }
    }
    productRecipe.out.push(recipe.out[productIndex]);
  }
  
  return productRecipe;
}

try {
  module.exports.findRecipeFor = findRecipeFor;
  module.exports.extractRecipeFor = extractRecipeFor;
}
catch(e) {;}