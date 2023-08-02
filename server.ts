import express from "express";
import { PrismaClient } from "@prisma/client";
import { json } from "express";
import { recipeIdRouter } from "./recipeID";

// Create an express app
const app = express();

// Tell the app to allow json in the request body
app.use(json());

const port = 3001;
// Create a prisma client
const prisma = new PrismaClient();

app.use("/recipes", recipeIdRouter);

app.get("/", (req, res) => {
  res.send("blah");
});

app.listen(port, () => {
  console.log(`⚡ Server listening on port: ${port}`);
});
