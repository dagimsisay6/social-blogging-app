import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Plus } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch posts if a user is logged in and not currently loading
    if (!loading && user && user.token) {
      const fetchMyPosts = async () => {
        setPostsLoading(true);
        try {
          const response = await fetch("http://localhost:5001/api/posts/my-posts", {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setPosts(data);
        } catch (err) {
          console.error("Failed to fetch user's posts:", err);
          setError("Failed to load your posts. Please try again later.");
        } finally {
          setPostsLoading(false);
        }
      };

      fetchMyPosts();
    } else if (!loading && !user) {
      // If no user is logged in, stop loading and clear posts
      setPostsLoading(false);
      setPosts([]);
    }
  }, [user, loading]);

  if (loading || postsLoading) {
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

      <main className="dashboard-content p-4">
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

        <section className="posts-section">
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
            <p className="text-gray-500 text-center">You have not created any posts yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;