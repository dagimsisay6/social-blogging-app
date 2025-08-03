// src/pages/AllPosts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserRound, Heart, MessageSquare } from "lucide-react";

const AllPosts = () => {
  // State to hold the posts, a loading indicator, and any error message.
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Number of posts per page

  // The base URL for your backend server.
  const serverUrl = "http://localhost:5001";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Updated API call to include pagination query parameters
        const response = await axios.get(`${serverUrl}/api/posts`, {
          params: { page: currentPage, limit: limit },
        });

        // Handle both array and paginated object responses for flexibility
        if (Array.isArray(response.data)) {
          setPosts(response.data);
          setTotalPages(1); // No pagination, so only one page
        } else if (response.data && response.data.posts) {
          setPosts(response.data.posts);
          setTotalPages(response.data.totalPages);
        } else {
          setPosts([]);
          setTotalPages(1);
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, limit]); // Re-fetch data when currentPage or limit changes

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <p className="text-xl text-gray-500 dark:text-gray-400">Loading posts...</p>
      </div>
    );
  }

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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Stats for likes and comments */}
                  <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center mr-4">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments?.length || 0}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
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

                  {/* "Read More" button */}
                  <div className="mt-4">
                    <Link
                      to={`/posts/${post._id}`}
                      className="inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllPosts;
