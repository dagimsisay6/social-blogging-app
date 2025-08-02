// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect to fetch posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/posts");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []); // The empty dependency array ensures this runs only once on mount

  if (loading || postsLoading) {
    return <div className="p-6 text-center">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">No user data available</div>;
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

      <main className="dashboard-content p-4">
        {/* User Profile Section (unchanged) */}
        <section className="user-profile bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
          <img
            src={user.profilePicture || "https://via.placeholder.com/100"}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full object-cover mr-6 border-4 border-blue-500"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </section>

        <nav className="flex justify-around border-b border-gray-300 mb-6">
          <button className="py-3 px-6 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Posts
          </button>
        </nav>

        {/* New Posts Section */}
        <section className="posts-section">
          <h3 className="text-2xl font-bold mb-4">Recent Posts</h3>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post._id} className="post-card bg-white rounded-lg shadow-md overflow-hidden">
                  {post.postImage && (
                    <img
                      src={`http://localhost:5001${post.postImage}`}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">{post.title}</h4>
                    <p className="text-gray-700 text-sm mb-4">{post.description}</p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <span>Posted on: {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No posts to display yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;