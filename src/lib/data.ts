import { promises as fs } from 'fs';
import path from 'path';
import { AppData, Category, Picture } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'app-data.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize default data
const defaultData: AppData = {
  categories: [
    {
      id: 'arabic-proverbs',
      name: 'Arabic Proverbs',
      color: '#10b981', // Emerald-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artworks-done-especially-for-my-kids',
      name: 'Artworks Done Especially For My Kids',
      color: '#ef4444', // Red-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'combination-design-and-colour',
      name: 'Combination Design and Colour',
      color: '#8b5cf6', // Violet-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'english-proverbs',
      name: 'English Proverbs',
      color: '#3b82f6', // Blue-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'khaldoon-unique-freehand-writing',
      name: 'Khaldoon Unique Freehand Writing',
      color: '#f97316', // Orange-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'modern-painting',
      name: 'Modern Painting',
      color: '#06b6d4', // Cyan-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'personal-names',
      name: 'Personal Names',
      color: '#ec4899', // Pink-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sign-label',
      name: 'Sign Label',
      color: '#eab308', // Yellow-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'still-life',
      name: 'Still Life',
      color: '#84cc16', // Lime-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 't-shirt',
      name: 'T Shirt',
      color: '#a855f7', // Purple-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-aya',
      name: 'Ultra Modern Aya',
      color: '#6366f1', // Indigo-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-duaa',
      name: 'Ultra Modern Duaa',
      color: '#14b8a6', // Teal-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-hadith',
      name: 'Ultra Modern Hadith',
      color: '#22c55e', // Green-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-style',
      name: 'Ultra Modern Style',
      color: '#f59e0b', // Amber-500
      createdAt: new Date().toISOString(),
    },
    {
      id: 'with-oriental-taste',
      name: 'With Oriental Taste',
      color: '#f43f5e', // Rose-500
      createdAt: new Date().toISOString(),
    },
  ],
  pictures: [],
  lastUpdated: new Date().toISOString(),
};

// Read data from JSON file
export async function readData(): Promise<AppData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with default data
    await writeData(defaultData);
    return defaultData;
  }
}

// Write data to JSON file
export async function writeData(data: AppData): Promise<void> {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Helper functions
export async function getCategories(): Promise<Category[]> {
  const data = await readData();
  return data.categories;
}

export async function getPictures(): Promise<Picture[]> {
  const data = await readData();
  return data.pictures;
}

export async function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const data = await readData();
  const newCategory: Category = {
    ...category,
    id: category.name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date().toISOString(),
  };
  data.categories.push(newCategory);
  await writeData(data);
  return newCategory;
}

export async function addPicture(picture: Omit<Picture, 'id' | 'uploadedAt'>): Promise<Picture> {
  const data = await readData();
  const newPicture: Picture = {
    ...picture,
    id: `pic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date().toISOString(),
  };
  data.pictures.push(newPicture);
  await writeData(data);
  return newPicture;
}

export async function updatePictureCategory(pictureId: string, categoryId: string | undefined): Promise<void> {
  const data = await readData();
  const picture = data.pictures.find(p => p.id === pictureId);
  if (picture) {
    picture.categoryId = categoryId;
    await writeData(data);
  }
}

export async function deletePicture(pictureId: string): Promise<void> {
  const data = await readData();
  data.pictures = data.pictures.filter(p => p.id !== pictureId);
  await writeData(data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const data = await readData();
  data.categories = data.categories.filter(c => c.id !== categoryId);
  // Remove category from pictures
  data.pictures.forEach(picture => {
    if (picture.categoryId === categoryId) {
      picture.categoryId = undefined;
    }
  });
  await writeData(data);
} 