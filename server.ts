import express from "express";
import { PrismaClient } from "@prisma/client";
import { json } from "express";
import { recipeRouter } from "./recipes";
import { toToken } from "./auth/jwt";

// Create an express app
const app = express();

// Tell the app to allow json in the request body
app.use(json());

const port = 3001;
// Create a prisma client
const prisma = new PrismaClient();

app.use("/recipes", recipeRouter);

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
