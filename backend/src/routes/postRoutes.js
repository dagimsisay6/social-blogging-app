// src/routes/postRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Post from "../models/Post.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// =========================
// GET All Posts (Public) - New route added
// =========================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "firstName lastName profilePicture") // Populate author details
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(posts);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// =========================
// CREATE POST (with multiple images)
// =========================
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const imagePaths = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const newPost = await Post.create({
      title,
      content,
      images: imagePaths,
      author: req.user._id,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
});

// =========================
// GET My Posts (Protected)
// =========================
router.get("/my-posts", protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// =========================
// UPDATE Post (Protected)
// =========================
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });

    if (title) post.title = title;
    if (content) post.content = content;

    if (req.files && req.files.length > 0) {
      post.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const updatedPost = await post.save();
    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error updating post" });
  }
});

// =========================
// DELETE Post (Protected)
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error deleting post" });
  }
});

// =========================
// GET Single Post by ID (increments views)
// =========================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "firstName lastName")
      .populate("comments.user", "firstName lastName");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error fetching post" });
  }
});

// =========================
// ADD Comment to a Post
// =========================
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = { user: req.user._id, text, createdAt: new Date() };
    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id).populate(
      "comments.user",
      "firstName lastName"
    );

    res
      .status(201)
      .json({ message: "Comment added", comments: updatedPost.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error adding comment" });
  }
});

// =========================
// TOGGLE Like/Unlike a Post
// =========================
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure likes is an array
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const userId = req.user._id.toString(); // convert ObjectId to string for comparison

    // Check if user has already liked the post
    const hasLiked = post.likes.some(
      (likeUserId) => likeUserId.toString() === userId
    );

    if (hasLiked) {
      // Remove user from likes array (unlike)
      post.likes.pull(userId);
    } else {
      // Add user to likes array (like)
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      likedByUser: !hasLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error toggling like" });
  }
});

export default router;
