"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Picture, Category } from "@/types";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

export default function AdminPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    currentFile: 0,
    totalFiles: 0,
    currentFileName: "",
    fileProgress: 0,
    overallProgress: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [picturesResponse, categoriesResponse] = await Promise.all([
        fetch("/api/pictures"),
        fetch("/api/categories"),
      ]);

      const picturesData = await picturesResponse.json();
      const categoriesData = await categoriesResponse.json();

      setPictures(picturesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const totalFiles = files.length;

    // Initialize progress
    setUploadProgress({
      currentFile: 0,
      totalFiles,
      currentFileName: "",
      fileProgress: 0,
      overallProgress: 0,
    });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type client-side
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file. Skipping.`);
          continue;
        }

        // Update progress for current file
        setUploadProgress((prev) => ({
          ...prev,
          currentFile: i + 1,
          currentFileName: file.name,
          fileProgress: 0,
          overallProgress: (i / totalFiles) * 100,
        }));

        // Use client upload for larger file support (up to 50MB)
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: JSON.stringify({ filename: file.name }),
          onUploadProgress: (progressEvent) => {
            const fileProgress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress((prev) => ({
              ...prev,
              fileProgress,
              overallProgress: ((i + fileProgress / 100) / totalFiles) * 100,
            }));
          },
        });

        // Save picture metadata
        await fetch("/api/pictures", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: blob.url,
            fileName: file.name,
          }),
        });

        // Update progress after file is saved
        setUploadProgress((prev) => ({
          ...prev,
          fileProgress: 100,
          overallProgress: ((i + 1) / totalFiles) * 100,
        }));
      }

      fetchData(); // Refresh the pictures list
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress({
        currentFile: 0,
        totalFiles: 0,
        currentFileName: "",
        fileProgress: 0,
        overallProgress: 0,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCategoryChange = async (
    pictureId: string,
    categoryId: string
  ) => {
    try {
      await fetch(`/api/pictures/${pictureId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: categoryId || undefined,
        }),
      });

      fetchData(); // Refresh the pictures list
    } catch (error) {
      console.error("Failed to update picture category:", error);
    }
  };

  const handleDeletePicture = async (pictureId: string) => {
    if (!confirm("Are you sure you want to delete this picture?")) {
      return;
    }

    try {
      await fetch(`/api/pictures/${pictureId}`, {
        method: "DELETE",
      });

      fetchData(); // Refresh the pictures list
    } catch (error) {
      console.error("Failed to delete picture:", error);
    }
  };

  const handleDeleteAllPictures = async () => {
    if (pictures.length === 0) {
      alert("No pictures to delete.");
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete ALL ${pictures.length} pictures from both the database and Vercel Blob storage.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to continue?`
    );

    if (!confirmed) {
      return;
    }

    // Second confirmation for extra safety
    const doubleConfirmed = confirm(
      "Last chance! Are you really sure you want to delete ALL pictures? This action is irreversible."
    );

    if (!doubleConfirmed) {
      return;
    }

    setDeletingAll(true);
    try {
      const response = await fetch("/api/pictures/delete-all", {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "All pictures deleted successfully!");
        fetchData(); // Refresh the pictures list
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete all pictures");
      }
    } catch (error) {
      console.error("Failed to delete all pictures:", error);
      alert("Failed to delete all pictures. Please try again.");
    } finally {
      setDeletingAll(false);
    }
  };

  const getCategoryById = (categoryId?: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Pictures Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload and manage pictures for your gallery
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Upload Pictures
        </h2>
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm sm:text-base font-medium text-indigo-600 hover:text-indigo-500">
                  Upload files
                </span>
                <span className="text-gray-500 text-sm sm:text-base">
                  {" "}
                  or drag and drop
                </span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, GIF, WebP up to 50MB
            </p>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
              <div className="w-full max-w-sm sm:max-w-md px-4 sm:px-6">
                <div className="text-center mb-4">
                  <div className="animate-pulse rounded-full h-3 w-3 bg-indigo-600 mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-700">
                    Uploading {uploadProgress.currentFile} of{" "}
                    {uploadProgress.totalFiles} files
                  </p>
                  <p
                    className="text-xs text-gray-500 truncate px-2"
                    title={uploadProgress.currentFileName}
                  >
                    {uploadProgress.currentFileName}
                  </p>
                </div>

                {/* Current File Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Current file</span>
                    <span>{uploadProgress.fileProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress.fileProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Overall progress</span>
                    <span>{Math.round(uploadProgress.overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pictures Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-900">
              Uploaded Pictures {pictures.length > 0 && `(${pictures.length})`}
            </h2>
            {pictures.length > 0 && (
              <button
                onClick={handleDeleteAllPictures}
                disabled={deletingAll}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete all pictures permanently"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {deletingAll ? "Deleting..." : "Delete All Pictures"}
              </button>
            )}
          </div>
        </div>

        {pictures.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-medium">No pictures uploaded yet</p>
            <p className="text-sm mt-1">Upload some pictures to get started</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {pictures.map((picture) => {
                const category = getCategoryById(picture.categoryId);
                return (
                  <div
                    key={picture.id}
                    className="relative group bg-gray-50 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={picture.url}
                        alt={picture.fileName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      />
                      {category && (
                        <div
                          className="absolute top-2 left-2 px-2 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <a
                            href={picture.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                            title="View full size"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                          </a>
                          <button
                            onClick={() => handleDeletePicture(picture.id)}
                            className="p-1.5 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                            title="Delete picture"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 sm:p-3">
                      <p
                        className="text-xs sm:text-sm font-medium text-gray-900 truncate"
                        title={picture.fileName}
                      >
                        {picture.fileName}
                      </p>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={picture.categoryId || ""}
                          onChange={(e) =>
                            handleCategoryChange(picture.id, e.target.value)
                          }
                          className="w-full text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">No category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(picture.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
