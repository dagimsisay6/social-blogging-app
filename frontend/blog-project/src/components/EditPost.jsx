import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const EditPost = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Effect to fetch post data when the component loads
  useEffect(() => {
    const fetchPost = async () => {
      if (!user || !user.token) {
        setError('You must be logged in to edit a post.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch post for editing.');
        }

        const postData = await response.json();

        // Pre-fill form fields with fetched data
        setTitle(postData.title);
        setDescription(postData.description);
        if (postData.postImage) {
          // Set the image preview from the backend
          setImagePreview(`http://localhost:5001${postData.postImage}`);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user && user.token && !loading) {
      fetchPost();
    }
  }, [id, user, loading]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !user.token) {
      setError('You must be logged in to edit a post.');
      return;
    }

    if (!title || !description || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imageFile) {
      formData.append('postImage', imageFile);
    }

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${id}`, {
        method: 'PUT', // <-- We use PUT for updating
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-posts');
      }, 1500);

    } catch (err) {
      console.error("Update failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return <div className="p-6 text-center">Loading post...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/my-posts')} className="p-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center">
          <span className="text-xl font-semibold">Edit Post</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-6">
        {/* Image Upload/Preview Section */}
        <div>
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div
                key="image-preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md"
              >
                <img src={imagePreview} alt="Post preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-2 right-2 p-2 bg-white/70 rounded-full text-red-600 hover:bg-white transition-colors"
                >
                  <Trash2 size={24} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="image-upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="flex flex-col items-center">
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs text-gray-500 mt-1">Accepts images up to 5MB</span>
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title Input */}
        <div className="mt-4">
          <label className="block text-lg font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a captivating title..."
            className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            required
          />
        </div>

        {/* Description/Content Section */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your blog post content here..."
            rows={5}
            className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
            required
          />
        </div>

        {/* Submission Status and Buttons */}
        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-center text-sm">Post updated successfully!</p>
        )}
        <button
          type="submit"
          className={`w-full py-4 px-6 rounded-full text-white font-semibold shadow-md transition-colors flex items-center justify-center ${!title || !description || isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          disabled={!title || !description || isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-6 w-6" />
          ) : (
            'Update Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default EditPost;