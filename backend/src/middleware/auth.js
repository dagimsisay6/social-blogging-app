import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @desc    Generate a JWT token for a user
 * @param   {string} id - The user's ID
 * @returns {string} - The signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Protect routes from unauthenticated users
 * @param   {object} req - The request object
 * @param   {object} res - The response object
 * @param   {function} next - The next middleware function
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (req.user) {
        next();
      } else {
        console.error("User not found for decoded ID:", decoded.id);
        res.status(404).json({ msg: "User not found" });
      }
    } catch (error) {
      console.error("Token verification failed or user lookup error:", error.message);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } else {
    console.warn("No token found in Authorization header.");
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};

export { generateToken, protect };