import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import AuthMiddleware, { AuthRequest } from "./auth/middleware";
import ratedRecipe from "./services/ratedRecipe";

export const recipeRouter = Router();
const prisma = new PrismaClient();

recipeRouter.get("/", (req, res) => {
  res.send("Hello from recipe router");
});

recipeRouter.get("/show/my", AuthMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  // request to a database to fetch a JSON with the data we want to display + id for further modifications
  const myRecipes = await prisma.recipe.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      prepTime: true,
      imgUrl: true,
      serves: true,
    },
  });
  // creating an array of recipeIds we fetched for a specific user
  const recipeIds: number[] = [];
  for (let aRecipe of myRecipes) {
    recipeIds.push(aRecipe.id);
  }
  // calling the function that return an array of objects with recipeId and calculated rating for each recipe
  const recipeIdRating = await ratedRecipe(recipeIds);
  // creating an array of objects we want to return to a client, collecting all necessary information
  const ratedRecipes = [];
  for (let i = 0; i < myRecipes.length; i++) {
    const ratingInfo = recipeIdRating.find(
      (anObj) => anObj.recipeId === myRecipes[i].id
    );
    ratedRecipes.push({
      name: myRecipes[i].name,
      prepTime: myRecipes[i].prepTime,
      imgUrl: myRecipes[i].imgUrl,
      serves: myRecipes[i].serves,
      recipeRating: !ratingInfo
        ? 0
        : Math.floor(
            ratingInfo["_avg"]["rating"] ? ratingInfo["_avg"]["rating"] : 0
          ),
    });
  }
  res.send(ratedRecipes);
});

recipeRouter.get("/:id", (req, res) => {
  res.send(req.params.id);
});
