import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// Use the server URL from environment variables, defaulting to localhost
const serverUrl = import.meta.env.API_URL || "http://localhost:5001";

const CreatePost = () => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: "", content: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return setMessage("You must be logged in to post.");

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("content", formData.content);

      imageFiles.forEach((file) => formDataObj.append("images", file));

      // Use the serverUrl variable here
      await axios.post(`${serverUrl}/api/posts`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Post created successfully!");
      setTimeout(() => navigate("/my-posts"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Create a New Post
      </h2>

      {message && (
        <div className="mb-4 text-center text-sm text-blue-600 dark:text-blue-400">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />

        <textarea
          name="content"
          placeholder="Write your post..."
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md h-40 dark:bg-gray-700 dark:text-white"
        ></textarea>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
