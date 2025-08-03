import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePictureUploader = ({ onClose }) => {
  const { token, loadUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    setUploading(true);
    try {
      const res = await axios.put("/api/auth/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Profile picture upload response:", res.data);

      await loadUser(); // refresh user data with new picture URL
      onClose(); // close the modal
    } catch (error) {
      alert("Upload failed. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow-lg max-w-sm mx-auto">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Update Profile Picture
      </h3>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="mb-4"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePictureUploader;
