import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthMiddleware, AuthRequest } from "./auth/middleware";
import ratedRecipe from "./services/ratedRecipe";

export const recipeRouter = Router();

const prisma = new PrismaClient();

// "rating": [
//   {
//     "_avg": {
//       "rating": 4
//     },
//     "recipeId": 1
//   }
// ]

recipeRouter.get("/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipeIdRating = await ratedRecipe([recipeId]);

  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
    },
    select: {
      name: true,
      instructions: true,
      ingredients: true,
      prepTime: true,
      serves: true,
      imgUrl: true,
    },
  });
  const recipeWithRating = { ...recipe };
  recipeWithRating.rating = recipeIdRating;
  res.send(recipeWithRating);
});

recipeRouter.patch("/:id", AuthMiddleware, async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const requestBody = req.body;
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

recipeRouter.post("/", AuthMiddleware, async (req, res) => {
  const requestBody = req.body;
  if (
    "name" in requestBody &&
    "instructions" in requestBody &&
    "ingredients" in requestBody &&
    "prepTime" in requestBody &&
    "categories" in requestBody &&
    "serves" in requestBody &&
    "imgUrl" in requestBody &&
    "userId" in requestBody
  ) {
    try {
      await prisma.recipe.create({
        data: {
          name: requestBody.name,
          instructions: requestBody.instructions,
          prepTime: requestBody.prepTime,
          userId: requestBody.userId,
          ingredients: requestBody.ingredients,
          serves: requestBody.serves,
          imgUrl: requestBody.imgUrl,
          categories: {
            connect: requestBody.categories.map((id: number) => {
              return { id: id };
            }),
          },
        },
      });
      res.status(201).send({ message: "Recipe created!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error });
    }
  } else {
    console.log(Object.keys(requestBody));
    res.status(400).send({
      message:
        "'name', 'instructions', 'ingredients', 'prepTime' and 'category' are required!",
    });
  }
});

// recipeRouter.get("/:id", (req, res) => {
//   res.send(req.params.id);
// });
