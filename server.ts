import express from "express";
import { PrismaClient } from "@prisma/client";
import { json } from "express";
import { recipeRouter } from "./recipes";
import ratedRecipe from "./services/ratedRecipe";
// Create an express app
const app = express();

// Tell the app to allow json in the request body
app.use(json());

const port = 3001;
// Create a prisma client
const prisma = new PrismaClient();

app.use("/recipes", recipeRouter);

app.get("/", async (req, res) => {
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      name: true,
      imgUrl: true,
      prepTime: true,
      serves: true,
    },
  });
  // creating an array of recipeIds we fetched for a specific user
  const recipeIds: number[] = [];
  for (let aRecipe of allRecipes) {
    recipeIds.push(aRecipe.id);
  }
  // calling the function that return an array of objects with recipeId and calculated rating for each recipe
  const recipeIdRating = await ratedRecipe(recipeIds);
  // creating an array of objects we want to return to a client, collecting all necessary information
  const ratedRecipes = [];
  for (let i = 0; i < allRecipes.length; i++) {
    const ratingInfo = recipeIdRating.find(
      (anObj) => anObj.recipeId === allRecipes[i].id
    );
    ratedRecipes.push({
      name: allRecipes[i].name,
      prepTime: allRecipes[i].prepTime,
      imgUrl: allRecipes[i].imgUrl,
      serves: allRecipes[i].serves,
      recipeRating: !ratingInfo
        ? 0
        : Math.floor(
            ratingInfo["_avg"]["rating"] ? ratingInfo["_avg"]["rating"] : 0
          ),
    });
  }
  res.send(ratedRecipes);
});

app.listen(port, () => {
  console.log(`⚡ Server listening on port: ${port}`);
});
