import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import the cors package
import { connectDB } from "./config/db.js";
import authRoutes from './routes/auth.js'; // Note the .js extension

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

// Use the cors middleware to allow requests from your frontend domain
app.use(cors());

// Init Middleware to parse JSON bodies
app.use(express.json());

// Define Routes
// This single line ensures that all routes in authRoutes are accessible under /api/auth
app.use('/api/auth', authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on PORT:${PORT}`);
  });
});
