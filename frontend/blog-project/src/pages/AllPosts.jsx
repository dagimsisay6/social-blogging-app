// src/pages/AllPosts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts"); // backend route for all posts
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post._id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow"
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p>{post.content}</p>
              <small>By {post.author.firstName}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllPosts;
