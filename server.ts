import express from "express";
import { PrismaClient } from "@prisma/client";
import { json } from "express";
import { recipeRouter } from "./recipes";
import ratedRecipe from "./services/ratedRecipe";
import { toToken } from "./auth/jwt";
import cors from "cors";

// Create an express app
const app = express();

// CORS headers
app.use(cors());

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
      categories: {
        select: {
          categoryName: true,
        },
      },
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
      id: allRecipes[i].id,
      name: allRecipes[i].name,
      prepTime: allRecipes[i].prepTime,
      imgUrl: allRecipes[i].imgUrl,
      serves: allRecipes[i].serves,
      categories: allRecipes[i].categories.map(
        (aCategory) => aCategory.categoryName
      ),
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

app.post("/login", async (req, res) => {
  const requestBody = req.body;
  if ("username" in requestBody && "password" in requestBody) {
    try {
      // First find the user
      const userToLogin = await prisma.user.findUnique({
        where: {
          username: requestBody.username,
        },
      });
      if (userToLogin && userToLogin.password === requestBody.password) {
        const token = toToken({ userId: userToLogin.id });
        res.status(200).send({ token: token });
        return;
      }
      // If we didn't find the user or the password doesn't match, send back an error message
      res.status(401).send({ message: "You are not authorized" });
    } catch (error) {
      // If we get an error, send back HTTP 500 (Server Error)
      res.status(500).send({ message: "Something went wrong!" });
    }
  } else {
    // If we are missing fields, send back a HTTP 400
    res
      .status(400)
      .send({ message: "'username' and 'password' are required!" });
  }
});
