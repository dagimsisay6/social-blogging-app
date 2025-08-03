import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserRound, ThumbsUp } from "lucide-react";

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();

  const serverUrl = "https://social-blogging-app-1-5k7h.onrender.com";
  const NAVBAR_HEIGHT = 70;

  const fetchUserPosts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${serverUrl}/api/posts/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [token]);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        `${serverUrl}/api/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { likesCount } = res.data;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, likes: new Array(likesCount).fill("x") } : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        No user data available. Please log in.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: NAVBAR_HEIGHT,
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
      className="dark:bg-gray-900 text-gray-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* User Profile Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
          {user.profilePicture ? (
            <img
              src={`${serverUrl}${user.profilePicture}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-24 h-24 rounded-full object-cover mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-blue-500"
            />
          ) : (
            <UserRound
              className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-2"
              size={96}
            />
          )}

          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </section>

        {/* My Posts Section */}
        <h3 className="text-2xl font-bold mb-6 border-b-2 border-blue-500 pb-2">
          My Posts
        </h3>

        <section>
          {loadingPosts ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Loading your posts...
            </p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              You haven't created any posts yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {post.images?.length > 0 && (
                    <div className="relative overflow-hidden">
                      <img
                        src={`${serverUrl}${post.images[0]}`}
                        alt={post.title}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}

                  <div className="p-4 flex flex-col justify-between h-auto">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => handleLike(post._id, e)}
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition"
                      >
                        <ThumbsUp size={18} />
                        <span className="text-sm">
                          {post.likes?.length || 0}
                        </span>
                      </button>
                      <span className="text-gray-400 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
