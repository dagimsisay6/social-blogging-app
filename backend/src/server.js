import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/api/blog", (req, res) => {
  res.send("all blogs");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server start on PORT:${PORT}`);
  });
});
