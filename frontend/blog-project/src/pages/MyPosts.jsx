import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import { Trash2, Pencil, ThumbsUp } from "lucide-react";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const serverUrl = "https://social-blogging-app-1-5k7h.onrender.com";

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/posts/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts", err);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [token]);

  const openDeleteModal = (id) => {
    setPostToDeleteId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDeleteId) return;

    try {
      await axios.delete(`${serverUrl}/api/posts/${postToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((post) => post._id !== postToDeleteId));
      setIsModalOpen(false);
      setPostToDeleteId(null);
    } catch (err) {
      console.error("Error deleting post", err);
      setIsModalOpen(false);
      setPostToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setPostToDeleteId(null);
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        `${serverUrl}/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { likesCount } = res.data;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                likes: new Array(likesCount).fill("dummy"),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  return (
    <div className="dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col px-4 sm:px-6 py-6 mt-9">
      <div className="w-full max-w-screen-lg mx-auto flex-1 flex flex-col">
        {/* Left-aligned heading */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          My Posts
        </h1>

        {posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
            You have not created any posts yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center mx-auto w-full">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col w-full max-w-sm mx-auto"
              >
                {post.images?.length > 0 && (
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <img
                      src={`${serverUrl}${post.images[0]}`}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}

                <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
                  <div
                    className="cursor-pointer mb-4"
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {post.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={(e) => handleLike(post._id, e)}
                        className="flex items-center p-2 text-blue-500 hover:text-blue-700 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ThumbsUp size={18} />
                        <span className="ml-1 text-sm">
                          {post.likes?.length || 0}
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-post/${post._id}`);
                        }}
                        className="p-2 text-yellow-500 hover:text-yellow-700 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(post._id);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this post? This action cannot be undone."
        />
      </div>
    </div>
  );
};

export default MyPosts;
