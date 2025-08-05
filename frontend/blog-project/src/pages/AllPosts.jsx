import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserRound, Heart, MessageSquare, Search } from "lucide-react";

// The updated AllPosts component now includes a search bar to filter posts.
const AllPosts = () => {
  // State for posts and loading status
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

  const serverUrl = "http://localhost:5001";
  const NAVBAR_HEIGHT = 64;
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${serverUrl}/api/posts`, {
          params: {
            page: currentPage,
            limit,
            search: searchTerm,
          },
        });

        // The API response handling is now more robust to prevent errors.
        if (Array.isArray(response.data)) {
          // Handles cases where the API returns a simple array of posts
          setPosts(response.data);
          setTotalPages(1);
          setCurrentPage(1);
        } else if (response.data?.posts) {
          // Handles the expected paginated response object
          setPosts(response.data.posts);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage);
        } else {
          // Fallback for unexpected API response format, now less likely to be hit
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
  }, [currentPage, limit, searchTerm]);

  // Handler for pagination button clicks
  const handlePageChange = (page) => {
    // Only change page if it's within valid range
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handler for the search button click
  const handleSearch = () => {
    // When a search is performed, reset to the first page.
    setCurrentPage(1);
    setSearchTerm(pendingSearchTerm);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Loading posts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: `${NAVBAR_HEIGHT}px`,
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
      className="dark:bg-gray-900 text-gray-900 dark:text-white p-4 transition-all duration-300"
    >
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center md:text-left">
          All Posts
        </h1>

        {/* Search Input and Button */}
        <div className="flex items-center justify-end mb-6">
          <div className="relative flex w-full max-w-sm rounded-lg shadow-md overflow-hidden">
            <input
              type="text"
              placeholder="Search posts..."
              value={pendingSearchTerm}
              onChange={(e) => setPendingSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full py-2 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            />
            <button
              onClick={handleSearch}
              className="flex-shrink-0 px-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
            No posts found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
                >
                  {post.images?.length > 0 && (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={`${serverUrl}${post.images[0]}`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center mr-4">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          {/* Updated to use the new likesCount property from the backend */}
                          {post.likesCount || 0}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {/* Updated to use the new commentsCount property from the backend */}
                          {post.commentsCount || 0}
                        </span>
                      </div>
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
                          By{" "}
                          <span className="font-semibold">
                            {post.author?.firstName} {post.author?.lastName}
                          </span>
                        </span>
                      </div>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

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
    </div>
  );
};

export default AllPosts;
