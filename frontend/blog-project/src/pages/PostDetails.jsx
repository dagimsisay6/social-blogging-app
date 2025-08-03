import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

// Use the server URL from environment variables, defaulting to localhost
const serverUrl = import.meta.env.API_URL || "http://localhost:5001";

const PostDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");

  // Fetch single post
  const fetchPost = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error("Error fetching post:", err);
      setMessage("Failed to load post.");
    } finally {
      setLoading(false);
    }
  };

  // Like/unlike post
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPost({
        ...post,
        likes: res.data.likedByUser
          ? [...(post.likes || []), "me"]
          : (post.likes || []).slice(0, -1),
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${serverUrl}/api/posts/${id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPost({ ...post, comments: res.data.comments });
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setMessage("Failed to add comment.");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading post...</div>;
  if (!post) return <div className="text-center mt-20">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {post.title}
      </h1>

      {post.images?.length > 0 && (
        <div className="mb-4">
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={`${serverUrl}${img}`}
              alt={post.title}
              className="w-full rounded mb-2"
            />
          ))}
        </div>
      )}

      <p className="text-gray-800 dark:text-gray-300 mb-4">{post.content}</p>

      <div className="flex justify-between items-center mb-6 text-gray-500 dark:text-gray-400 text-sm">
        <span>
          By {post.author?.firstName} {post.author?.lastName} |{" "}
          {new Date(post.createdAt).toLocaleDateString()} | 👁 {post.views} views
        </span>
        {isAuthenticated && (
          <button
            onClick={handleLike}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            👍 {post.likes?.length || 0}
          </button>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        Comments ({post.comments.length})
      </h2>
      <div className="space-y-4 mb-6">
        {post.comments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          post.comments.map((comment, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <p className="text-gray-800 dark:text-gray-200">
                <strong>
                  {comment.user?.firstName} {comment.user?.lastName}:
                </strong>{" "}
                {comment.text}
              </p>
              <small className="text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            rows={3}
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Add Comment
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 text-red-500 text-sm text-center">{message}</div>
      )}
    </div>
  );
};

export default PostDetails;
