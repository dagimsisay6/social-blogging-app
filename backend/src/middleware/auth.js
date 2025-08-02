// backend/src/middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ msg: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};

export { generateToken, protect };