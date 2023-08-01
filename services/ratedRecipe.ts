import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// requesting rows from comment table that corresponds to recipeIds of the user, grouping it to calculate
// the average for each group with the same recipeId, we asked to calculate average for data in rating column
const ratedRecipe = async (recipeIds: number[]) => {
  const recipeIdRating = await prisma.comment.groupBy({
    by: ["recipeId"],
    _avg: {
      rating: true,
    },
    where: {
      recipeId: {
        in: recipeIds,
      },
    },
  });
  return recipeIdRating;
};

export default ratedRecipe;
