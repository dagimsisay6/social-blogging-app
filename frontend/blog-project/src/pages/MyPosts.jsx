//pages/myPost.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch logged-in user's posts
  const fetchMyPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/posts/my-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts", err);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // Delete post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5001/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  // Toggle like/unlike
  const handleLike = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:5001/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { likesCount } = res.data;

      // Update likes count in UI using likesCount from backend
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                likes: new Array(likesCount).fill("dummy"), // just to update length for UI
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        My Posts
      </h1>

      {posts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          You have not created any posts yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/posts/${post._id}`)}
            >
              {post.images?.length > 0 && (
                <img
                  src={`http://localhost:5001${post.images[0]}`}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                  {post.content}
                </p>

                <small className="block mt-2 text-gray-500 dark:text-gray-400">
                  Created on {new Date(post.createdAt).toLocaleDateString()}
                </small>

                <div className="flex justify-between items-center mt-4">
                  {/* Like button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post._id);
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    👍 {post.likes?.length || 0}
                  </button>

                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-post/${post._id}`);
                      }}
                      className="text-yellow-500 hover:text-yellow-700 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post._id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
