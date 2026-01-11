import axios from 'axios';

// S'assurer que l'URL ne se termine pas par /api pour éviter le double /api/api/
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sil-talents.ma';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') : baseUrl;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
  status: 'Draft' | 'Published';
  authorId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  views: number;
  readingTime: number;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description?: string;
  fileUrl: string;
  type: 'PDF' | 'Guide' | 'Template';
  downloadCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
}

export const cmsApi = {
  // Articles
  getArticles: async (params?: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    status?: 'Draft' | 'Published';
  }): Promise<PaginatedResponse<Article>> => {
    const response = await axios.get(`${API_URL}/api/cms/articles`, { params });
    // L'intercepteur backend encapsule la réponse dans { success: true, data: ... }
    // On doit extraire response.data.data pour obtenir la vraie réponse
    return response.data.data || response.data;
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await axios.get(`${API_URL}/api/cms/articles/${slug}`);
    // L'intercepteur backend encapsule la réponse dans { success: true, data: ... }
    return response.data.data || response.data;
  },

  // Ressources
  getResources: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
  }): Promise<PaginatedResponse<Resource>> => {
    const response = await axios.get(`${API_URL}/api/cms/resources`, { params });
    // L'intercepteur backend encapsule la réponse dans { success: true, data: ... }
    // On doit extraire response.data.data pour obtenir la vraie réponse
    return response.data.data || response.data;
  },

  getResourceBySlug: async (slug: string): Promise<Resource> => {
    const response = await axios.get(`${API_URL}/api/cms/resources/${slug}`);
    // L'intercepteur backend encapsule la réponse dans { success: true, data: ... }
    return response.data.data || response.data;
  },

  downloadResource: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/cms/resources/${id}/download`);
    // L'intercepteur backend encapsule la réponse dans { success: true, data: ... }
    return response.data.data || response.data;
  },
};


