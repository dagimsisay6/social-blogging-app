import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/post.js';
import { protect } from '../middleware/auth.js'
const router = express.Router();

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
  },
});

// Route to create a new post (protected)
// Now a user must be logged in to create a post
router.post('/', protect, upload.single('postImage'), async (req, res) => {
  try {
    const { title, description } = req.body;
    let postImage = null;

    if (req.file) {
      postImage = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      title,
      description,
      postImage,
      user: req.user._id, // Assign the post to the authenticated user
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully!',
      post: newPost,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create post', error: err.message });
  }
});

// Route to get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to update a post (protected and owner-only)
router.put('/:id', protect, upload.single('postImage'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update the post fields
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;

    if (req.file) {
      // Handle new image upload
      post.postImage = `/uploads/${req.file.filename}`;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Route to delete a post (protected and owner-only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the authenticated user is the owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne(); // Use deleteOne() instead of remove()
    res.json({ message: 'Post deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// We also need to get posts for the dashboard.
// Let's modify the GET route to retrieve posts by a specific user.
router.get('/my-posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

// Existing route to get all posts (for public blog feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Get all posts, newest first
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

export default router;