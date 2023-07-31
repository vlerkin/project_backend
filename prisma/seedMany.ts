import { PrismaClient } from "@prisma/client";
import recipeData from "./data/recipeData.json";
import categoryData from "./data/categoryData.json";

const prisma = new PrismaClient();

const seedMany = async () => {
  for (let aCategory of categoryData) {
    await prisma.category.create({
      data: aCategory,
    });
  }
  for (let aRecipe of recipeData) {
    await prisma.recipe.create({
      data: {
        id: aRecipe.id,
        name: aRecipe.name,
        imgUrl: aRecipe.imgUrl,
        instructions: aRecipe.instructions,
        ingredients: aRecipe.ingredients,
        prepTime: aRecipe.prepTime,
        serves: aRecipe.serves,
        userId: aRecipe.userId,
        categories: {
          connect: aRecipe.categories.map((id) => {
            return { id: id };
          }),
        },
      },
    });
  }
};

seedMany();
