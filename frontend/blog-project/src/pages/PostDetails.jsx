import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { ArrowLeft, ThumbsUp } from "lucide-react";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");

  const serverUrl = "http://localhost:5001";

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic UI update
      setPost((prev) => ({
        ...prev,
        likes: res.data.likedByUser
          ? [...(prev.likes || []), "me"]
          : (prev.likes || []).slice(0, -1),
      }));
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

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Loading post...
      </div>
    );
  if (!post)
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Post not found.
      </div>
    );

  return (
    <div className="dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pt-8 pb-12 mt-16 px-4">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 
                     dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-800 dark:text-gray-200 rounded-md transition w-fit"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>

        {/* Post Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {post.title}
          </h1>

          {/* Post Images */}
          {post.images?.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`${serverUrl}${img}`}
                  alt={post.title}
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <p className="text-gray-800 dark:text-gray-300 mb-4 leading-relaxed">
            {post.content}
          </p>

          {/* Meta Info */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 text-gray-500 dark:text-gray-400 text-sm">
            <span>
              By {post.author?.firstName} {post.author?.lastName} |{" "}
              {new Date(post.createdAt).toLocaleDateString()} | 👁 {post.views}{" "}
              views
            </span>
            {isAuthenticated && (
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition"
              >
                <ThumbsUp size={18} />
                <span className="text-sm">{post.likes?.length || 0}</span>
              </button>
            )}
          </div>

          {/* Comments Section */}
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

          {/* Add Comment */}
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              >
                Add Comment
              </button>
            </form>
          )}

          {message && (
            <div className="mt-4 text-red-500 text-sm text-center">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
