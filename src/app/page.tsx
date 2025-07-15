"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Settings,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { Picture, Category } from "@/types";
import Image from "next/image";
import Link from "next/link";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function GalleryPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const getCategoryById = (categoryId?: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const filteredPictures =
    selectedCategory === "all"
      ? pictures
      : pictures.filter((picture) => picture.categoryId === selectedCategory);

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = { all: pictures.length };

    categories.forEach((category) => {
      stats[category.id] = pictures.filter(
        (pic) => pic.categoryId === category.id
      ).length;
    });

    return stats;
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

  const handleDownloadAll = async () => {
    if (filteredPictures.length === 0) {
      alert("No pictures to download in this category.");
      return;
    }

    setDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(
        selectedCategory === "all"
          ? "All Pictures"
          : getCategoryById(selectedCategory)?.name || "Pictures"
      );

      // Download all images and add to zip
      for (let i = 0; i < filteredPictures.length; i++) {
        const picture = filteredPictures[i];
        try {
          const response = await fetch(picture.url);
          const blob = await response.blob();

          // Get file extension from URL or use jpg as default
          const urlParts = picture.url.split(".");
          const extension =
            urlParts.length > 1
              ? urlParts[urlParts.length - 1].split("?")[0]
              : "jpg";
          const fileName = `${picture.fileName.replace(
            /\.[^/.]+$/,
            ""
          )}.${extension}`;

          folder?.file(fileName, blob);
        } catch (error) {
          console.error(`Failed to download ${picture.fileName}:`, error);
          // Continue with other images even if one fails
        }
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const categoryName =
        selectedCategory === "all"
          ? "All-Pictures"
          : getCategoryById(selectedCategory)?.name.replace(/\s+/g, "-") ||
            "Pictures";

      saveAs(content, `${categoryName}-Gallery.zip`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Picture Gallery
              </h1>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {selectedCategory === "all"
                  ? "All Pictures"
                  : getCategoryById(selectedCategory)?.name || "Pictures"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {filteredPictures.length} picture
                {filteredPictures.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">
                      All Categories ({categoryStats.all})
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({categoryStats[category.id] || 0})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={handleDownloadAll}
                  disabled={downloading || filteredPictures.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={`Download all ${filteredPictures.length} pictures in ${
                    selectedCategory === "all"
                      ? "all categories"
                      : getCategoryById(selectedCategory)?.name ||
                        "this category"
                  }`}
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download ({filteredPictures.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All ({categoryStats.all})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    {category.name} ({categoryStats[category.id] || 0})
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Pictures Grid */}
        {pictures.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pictures yet
            </h3>
            <p className="text-gray-600">
              Pictures will appear here once uploaded by the admin.
            </p>
          </div>
        ) : filteredPictures.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pictures in this category
            </h3>
            <p className="text-gray-600">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPictures.map((picture) => {
              const category = getCategoryById(picture.categoryId);
              return (
                <div
                  key={picture.id}
                  className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={picture.url}
                      alt={picture.fileName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                    {category && (
                      <div 
                        className="absolute top-2 left-2 px-2 py-1 rounded text-white text-xs font-medium shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
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
                        className="w-full text-xs text-black border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Picture Gallery - Sort and view pictures by category
          </p>
        </div>
      </footer>
    </div>
  );
}
