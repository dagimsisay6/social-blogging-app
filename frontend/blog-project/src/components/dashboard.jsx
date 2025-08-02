import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();

  // Fetch the user's posts
  const fetchUserPosts = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5001/api/posts/my-posts", {
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

  // Handle like toggle
  const handleLike = async (id, e) => {
    e.stopPropagation(); // ⛔ Stop the card click
    try {
      const res = await axios.post(
        `http://localhost:5001/api/posts/${id}/like`,
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
    return <div className="p-6 text-center">Loading your dashboard...</div>;
  }

  // Handle case where user is not logged in after initial loading
  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">Please log in to view your personal dashboard.</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <div className="flex items-center">
            <span className="text-xl font-semibold">
              {user.firstName}'s Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-content p-4 max-w-7xl mx-auto">
        {/* User Profile Section */}
        <section className="user-profile bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
          <img
            src={
              user.profilePicture
                ? `${user.profilePicture}?t=${Date.now()}`
                : "https://via.placeholder.com/100"
            }
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full object-cover mr-6 border-4 border-blue-500"
          />

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </section>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">My Recent Posts</h3>
          <button
            onClick={() => navigate('/new-post')}
            className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Post</span>
          </button>
        </div>

        {/* User Posts Grid */}
        <section>
          {loadingPosts ? (
            <p className="text-center text-gray-600">Loading your posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-600">
              You haven't created any posts yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {post.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <button
                        onClick={(e) => handleLike(post._id, e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        👍 {post.likes?.length || 0}
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
      </main>
    </div>
  );
};

export default Dashboard;