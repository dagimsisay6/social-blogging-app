// src/pages/AllPosts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

const AllPosts = () => {
  // State to hold the posts, a loading indicator, and any error message.
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The base URL for your backend server.
  const serverUrl = "http://localhost:5001";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/posts`);
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Show a loading message while fetching data.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <p className="text-xl text-gray-500 dark:text-gray-400">Loading posts...</p>
      </div>
    );
  }

  // Show an error message if the fetch failed.
  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">All Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center text-lg">No posts have been created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            // The Link component makes the entire card clickable and navigates to the post details page.
            <Link key={post._id} to={`/posts/${post._id}`} className="group block">
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                {/* Display post image if it exists */}
                {post.images && post.images.length > 0 && (
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={`${serverUrl}${post.images[0]}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {post.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {post.content}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                    {/* Display author details */}
                    <div className="flex items-center">
                      {post.author?.profilePicture ? (
                        <img
                          src={`${serverUrl}${post.author.profilePicture}`}
                          alt={post.author.firstName}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <UserRound className="w-8 h-8 mr-2 rounded-full bg-gray-200 dark:bg-gray-700 p-1" />
                      )}
                      <span>
                        By <span className="font-semibold">{post.author?.firstName} {post.author?.lastName}</span>
                      </span>
                    </div>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPosts;
