import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import AuthMiddleware, { AuthRequest } from "./auth/middleware";
import ratedRecipe from "./services/ratedRecipe";

export const recipeRouter = Router();
const prisma = new PrismaClient();

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
  res.send(recipeIdRating);
});

recipeRouter.delete("/:id", AuthMiddleware, async (req: AuthRequest, res) => {
  const recipeId = parseInt(req.params.id);
  const userId = req.userId;
  // let's check if requested recipeId belongs to this user, if the user is authorized to
  // make changes
  const userRecipe = await prisma.recipe.findUnique({
    where: {
      userId: userId,
      id: recipeId,
    },
  });
  // if userRecipe is empty it means that this user is not authorized to make changes
  if (!userRecipe || !userId) {
    res.status(401).send({ message: "You are not authorized" });
    return;
  }

  if (!recipeId) {
    res.status(404).send({ message: "Recipe not found" });
    return;
  }
  try {
    console.log(recipeId);
    await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
    res.status(200).send({ message: "Recipe successfully deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

recipeRouter.post("/:recipeId/comments", async (req, res) => {
  const requestBody = req.body;
  const recipeId = parseInt(req.params.recipeId);
  if ("name" in requestBody && "review" in requestBody) {
    try {
      await prisma.comment.create({
        data: {
          name: requestBody.name,
          review: requestBody.review,
          recipeId: recipeId,
          rating: requestBody.rating,
        },
      });
      res.status(201).send({ message: "Comment created!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error });
    }
  } else {
    res.status(400).send({
      message: "'name', 'review', 'rating' are required!",
    });
  }
});

recipeRouter.get("/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipeIdRating = await ratedRecipe([recipeId]);

  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
    },
    select: {
      id: true,
      name: true,
      instructions: true,
      ingredients: true,
      prepTime: true,
      serves: true,
      imgUrl: true,
    },
  });
  const recipeWithRating = { ...recipe };
  recipeWithRating.rating = Math.floor(recipeIdRating[0]._avg.rating);
  res.send(recipeWithRating);
});

recipeRouter.patch("/:id", AuthMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const recipeId = parseInt(req.params.id);
  const requestBody = req.body;
  if (!recipeId || !userId) {
    res.status(401).send({ message: "You are not authorized" });
    return;
  }
  try {
    await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: requestBody,
    });
    res.status(200).send({ message: "Recipe updated!" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

recipeRouter.post("/", AuthMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    return;
  }
  const requestBody = req.body;
  if (
    "name" in requestBody &&
    "instructions" in requestBody &&
    "ingredients" in requestBody &&
    "prepTime" in requestBody &&
    "categories" in requestBody &&
    "serves" in requestBody &&
    "imgUrl" in requestBody
  ) {
    try {
      await prisma.recipe.create({
        data: {
          name: requestBody.name,
          instructions: requestBody.instructions,
          prepTime: requestBody.prepTime,
          userId: userId,
          ingredients: requestBody.ingredients,
          serves: requestBody.serves,
          imgUrl: requestBody.imgUrl,
          categories: {
            connect: requestBody.categories,
          },
        },
      });
      res.status(201).send({ message: "Recipe created!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error });
    }
  } else {
    res.status(400).send({
      message: "'name', 'review', 'rating' are required!",
    });
  }
});

recipeRouter.get("/:recipeId/comments", async (req, res) => {
  const recipeId = parseInt(req.params.recipeId);
  const commentForRecipe = await prisma.comment.findMany({
    where: {
      recipeId: recipeId,
    },
    select: {
      name: true,
      review: true,
      created_at: true,
      rating: true,
    },
  });
  res.send(commentForRecipe);
});
