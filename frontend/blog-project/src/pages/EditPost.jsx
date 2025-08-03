import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({ title: "", content: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/posts/${id}`);
        setFormData({ title: res.data.title, content: res.data.content });
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("content", formData.content);
      imageFiles.forEach((file) => formDataObj.append("images", file));

      await axios.put(`http://localhost:5001/api/posts/${id}`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/my-posts");
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Edit Post
      </h2>

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
          {loading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
};

export default EditPost;
