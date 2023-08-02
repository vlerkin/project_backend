import { PrismaClient } from "@prisma/client";
import commentData from "./data/commentData.json";
import recipeData from "./data/recipeData.json";
import categoryData from "./data/categoryData.json";
import userData from "./data/userData.json";

const prisma = new PrismaClient();

const seed = async () => {
  // for (let aUser of userData) {
  //   await prisma.user.create({
  //     data: aUser,
  //   });
  // }

  for (let aComment of commentData) {
    await prisma.comment.create({
      data: aComment,
    });
  }
};

seed();
