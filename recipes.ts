import { Router } from "express";

export const recipeRouter = Router();

recipeRouter.get("/", (req, res) => {
  res.send("Hello from recipe router");
});

recipeRouter.get("/:id", (req, res) => {
  res.send(req.params.id);
});
