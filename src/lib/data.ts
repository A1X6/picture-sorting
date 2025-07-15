import { get } from '@vercel/edge-config';
import { AppData, Category, Picture } from '@/types';

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

// Read data from Edge Config
export async function readData(): Promise<AppData> {
  try {
    const data = await get('appData') as AppData | null;
    return data || defaultData;
  } catch (error) {
    console.error('Failed to read from Edge Config:', error);
    return defaultData;
  }
}

// Update Edge Config using Vercel API
async function updateEdgeConfig(data: AppData): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  
  if (!edgeConfigId || !vercelToken) {
    throw new Error('EDGE_CONFIG_ID and VERCEL_TOKEN must be set');
  }

  data.lastUpdated = new Date().toISOString();

  try {
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'appData',
            value: data,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Config update failed: ${response.status} ${errorText}`);
    }

    // Edge Config updates can take a few seconds to propagate
    console.log('Edge Config updated successfully');
  } catch (error) {
    console.error('Failed to update Edge Config:', error);
    throw error;
  }
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
  await updateEdgeConfig(data);
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
  await updateEdgeConfig(data);
  return newPicture;
}

export async function updatePictureCategory(pictureId: string, categoryId: string | undefined): Promise<void> {
  const data = await readData();
  const picture = data.pictures.find(p => p.id === pictureId);
  if (picture) {
    picture.categoryId = categoryId;
    await updateEdgeConfig(data);
  }
}

export async function deletePicture(pictureId: string): Promise<void> {
  const data = await readData();
  data.pictures = data.pictures.filter(p => p.id !== pictureId);
  await updateEdgeConfig(data);
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
  await updateEdgeConfig(data);
} 