export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Picture {
  id: string;
  url: string;
  fileName: string;
  categoryId?: string;
  uploadedAt: string;
  description?: string;
}

export interface AppData {
  categories: Category[];
  pictures: Picture[];
  lastUpdated: string;
}

export interface AdminConfig {
  isAuthenticated: boolean;
  password: string;
} 