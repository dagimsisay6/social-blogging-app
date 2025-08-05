import express from "express";
import { protect } from "../middleware/auth.js";
import Post from "../models/Post.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// A single, robust GET route for posts with pagination and search functionality.
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || "";

    // The aggregation pipeline to handle search, pagination, and author population.
    const pipeline = [];

    // 1. Match posts based on the search term (case-insensitive).
    // This is the first stage to filter the data before further processing.
    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { content: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // 2. Use $facet to run multiple pipelines in a single query.
    // This allows us to get both the paginated results and the total count.
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalPosts" }],
        data: [
          // 3. Sort by creation date in descending order (newest first).
          { $sort: { createdAt: -1 } },
          // 4. Skip the posts based on the current page.
          { $skip: skip },
          // 5. Limit the number of posts per page.
          // This is the critical part to ensure only 10 posts are returned.
          { $limit: limit },
          // 6. Look up the author details from the "users" collection.
          {
            $lookup: {
              from: "users", // The name of the user collection
              localField: "author", // The field in the current Post collection
              foreignField: "_id", // The field in the "users" collection
              as: "author", // The output array field name
            },
          },
          // 7. Deconstruct the author array field to a single object.
          {
            $unwind: "$author",
          },
          // 8. Project the final output, selecting only the necessary fields and
          // adding a count for likes and comments.
          {
            $project: {
              title: 1,
              content: 1,
              images: 1,
              createdAt: 1,
              views: 1,
              commentsCount: { $size: "$comments" },
              likesCount: { $size: "$likes" },
              author: {
                _id: "$author._id",
                firstName: "$author.firstName",
                lastName: "$author.lastName",
                profilePicture: "$author.profilePicture",
              },
            },
          },
        ],
      },
    });

    const result = await Post.aggregate(pipeline);

    const [{ metadata, data }] = result;
    const totalPosts = metadata.length > 0 ? metadata[0].totalPosts : 0;
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts: data,
      currentPage: page,
      totalPages,
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// CREATE POST with multiple images
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

// GET My Posts Protected
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

// DELETE Post (Protected)
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

// GET Single Post by ID (increments views)
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

// ADD Comment to a Post
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

// TOGGLE Like/Unlike a Post
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
