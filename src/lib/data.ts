import { PrismaClient } from "@prisma/client";
import { Category, Picture } from "@/types";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Function to log operations to file
function logToFile(operation: string, data: unknown) {
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, "data-operations.log");
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      data: JSON.stringify(data, null, 2),
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
}

// Transform Prisma Category to our Category interface
function transformCategory(prismaCategory: {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}): Category {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    color: prismaCategory.color,
    createdAt: prismaCategory.createdAt.toISOString(),
  };
}

// Transform Prisma Picture to our Picture interface
function transformPicture(prismaPicture: {
  id: string;
  url: string;
  fileName: string;
  description: string | null;
  uploadedAt: Date;
  categoryId: string | null;
}): Picture {
  return {
    id: prismaPicture.id,
    url: prismaPicture.url,
    fileName: prismaPicture.fileName,
    description: prismaPicture.description || undefined,
    uploadedAt: prismaPicture.uploadedAt.toISOString(),
    categoryId: prismaPicture.categoryId || undefined,
  };
}

// Default categories to seed the database
const defaultCategories = [
  {
    id: "arabic-proverbs",
    name: "Arabic Proverbs",
    color: "#10b981", // Emerald-500
  },
  {
    id: "artworks-done-especially-for-my-kids",
    name: "Artworks Done Especially For My Kids",
    color: "#ef4444", // Red-500
  },
  {
    id: "combination-design-and-colour",
    name: "Combination Design and Colour",
    color: "#8b5cf6", // Violet-500
  },
  {
    id: "english-proverbs",
    name: "English Proverbs",
    color: "#3b82f6", // Blue-500
  },
  {
    id: "khaldoon-unique-freehand-writing",
    name: "Khaldoon Unique Freehand Writing",
    color: "#f97316", // Orange-500
  },
  {
    id: "modern-painting",
    name: "Modern Painting",
    color: "#06b6d4", // Cyan-500
  },
  {
    id: "personal-names",
    name: "Personal Names",
    color: "#ec4899", // Pink-500
  },
  {
    id: "sign-label",
    name: "Sign Label",
    color: "#eab308", // Yellow-500
  },
  {
    id: "still-life",
    name: "Still Life",
    color: "#84cc16", // Lime-500
  },
  {
    id: "t-shirt",
    name: "T Shirt",
    color: "#a855f7", // Purple-500
  },
  {
    id: "ultra-modern-aya",
    name: "Ultra Modern Aya",
    color: "#6366f1", // Indigo-500
  },
  {
    id: "ultra-modern-duaa",
    name: "Ultra Modern Duaa",
    color: "#14b8a6", // Teal-500
  },
  {
    id: "ultra-modern-hadith",
    name: "Ultra Modern Hadith",
    color: "#22c55e", // Green-500
  },
  {
    id: "ultra-modern-style",
    name: "Ultra Modern Style",
    color: "#f59e0b", // Amber-500
  },
  {
    id: "with-oriental-taste",
    name: "With Oriental Taste",
    color: "#f43f5e", // Rose-500
  },
];

// Initialize database with default categories if empty
export async function initializeDatabase(): Promise<void> {
  try {
    const existingCategories = await prisma.category.count();
    if (existingCategories === 0) {
      await prisma.category.createMany({
        data: defaultCategories,
      });
      console.log("Database initialized with default categories");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Categories CRUD operations
export async function getCategories(): Promise<Category[]> {
  try {
    await initializeDatabase(); // Ensure default categories exist
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    const transformedCategories = categories.map(transformCategory);
    // logToFile("Get categories", transformedCategories);
    return transformedCategories;
  } catch (error) {
    console.error("Failed to get categories:", error);
    // logToFile("Get categories error", error);
    return [];
  }
}

export async function addCategory(
  category: Omit<Category, "id" | "createdAt">
): Promise<Category> {
  try {
    const id = category.name.toLowerCase().replace(/\s+/g, "-");
    const newCategory = await prisma.category.create({
      data: {
        id,
        name: category.name,
        color: category.color || "#6b7280", // Default gray if no color provided
      },
    });
    const transformedCategory = transformCategory(newCategory);
    // logToFile("Add category", transformedCategory);
    return transformedCategory;
  } catch (error) {
    console.error("Failed to add category:", error);
    // logToFile("Add category error", error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    // First, update all pictures that have this category to have no category
    await prisma.picture.updateMany({
      where: {
        categoryId: categoryId,
      },
      data: {
        categoryId: null,
      },
    });

    // Then delete the category
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    
    // logToFile("Delete category", { categoryId });
  } catch (error) {
    console.error("Failed to delete category:", error);
    // logToFile("Delete category error", error);
    throw error;
  }
}

// Pictures CRUD operations
export async function getPictures(): Promise<Picture[]> {
  try {
    const pictures = await prisma.picture.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
    });
    const transformedPictures = pictures.map(transformPicture);
    // logToFile("Get pictures", transformedPictures);
    return transformedPictures;
  } catch (error) {
    console.error("Failed to get pictures:", error);
    // logToFile("Get pictures error", error);
    return [];
  }
}

export async function addPicture(
  picture: Omit<Picture, "id" | "uploadedAt">
): Promise<Picture> {
  try {
    const id = `pic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPicture = await prisma.picture.create({
      data: {
        id,
        url: picture.url,
        fileName: picture.fileName,
        description: picture.description || null,
        categoryId: picture.categoryId || null,
      },
    });
    const transformedPicture = transformPicture(newPicture);
    // logToFile("Add picture", transformedPicture);
    return transformedPicture;
  } catch (error) {
    console.error("Failed to add picture:", error);
    // logToFile("Add picture error", error);
    throw error;
  }
}

export async function updatePictureCategory(
  pictureId: string,
  categoryId: string | undefined
): Promise<void> {
  try {
    await prisma.picture.update({
      where: {
        id: pictureId,
      },
      data: {
        categoryId: categoryId || null,
      },
    });
    // logToFile("Update picture category", { pictureId, categoryId });
  } catch (error) {
    console.error("Failed to update picture category:", error);
    // logToFile("Update picture category error", error);
    throw error;
  }
}

export async function deletePicture(pictureId: string): Promise<void> {
  try {
    await prisma.picture.delete({
      where: {
        id: pictureId,
      },
    });
    // logToFile("Delete picture", { pictureId });
  } catch (error) {
    console.error("Failed to delete picture:", error);
    // logToFile("Delete picture error", error);
    throw error;
  }
}

// Legacy function for compatibility - just return categories
export async function readData() {
  const categories = await getCategories();
  const pictures = await getPictures();
  return {
    categories,
    pictures,
    lastUpdated: new Date().toISOString(),
  };
}
