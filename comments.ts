import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";

export const commentRouter = Router();
const prisma = new PrismaClient();

commentRouter.get("/:recipeId", async (req, res) => {
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

commentRouter.post("/:recipeId/comments", async (req, res) => {
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
