// social-blogging-app/backend/src/middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @desc    Generate a JWT token for a user
 * @param   {string} id - The user's ID
 * @returns {string} - The signed JWT token
 */
export const generateToken = (id) => {
  // Signs the JWT with the user's ID and the secret from your .env file.
  // The token will be valid for 30 days.
  console.log(
    "Generating token with JWT_SECRET:",
    process.env.JWT_SECRET ? "Loaded" : "NOT LOADED / UNDEFINED"
  ); // Check secret
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
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Get the token from the header (remove the 'Bearer' prefix)
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received in protect middleware:", token); // Log the token

      // 3. Verify the token using the secret key
      console.log(
        "Verifying token with JWT_SECRET:",
        process.env.JWT_SECRET ? "Loaded" : "NOT LOADED / UNDEFINED"
      ); // Check secret again
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", decoded); // Log decoded payload

      // 4. Find the user by ID from the decoded token payload
      // .select('-password') excludes the password from the returned user object
      req.user = await User.findById(decoded.id).select("-password");

      // 5. If a user is found, proceed to the next middleware function
      if (req.user) {
        console.log("User found for ID:", req.user._id); // Log user ID
        next();
      } else {
        console.error("User not found for decoded ID:", decoded.id);
        res.status(404).json({ msg: "User not found" }); // Token valid, but user doesn't exist
      }
    } catch (error) {
      console.error(
        "Token verification failed or user lookup error:",
        error.message
      ); // Log specific error message
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } else {
    // 6. If no token is found in the request, return an error
    console.warn("No token found in Authorization header."); // Warning if no token
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};
