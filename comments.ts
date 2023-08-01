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
