import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
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
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  // Métadonnées
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

@Injectable()
export class CmsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ========== ARTICLES ==========

  async findAllArticles(params?: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    status?: 'Draft' | 'Published';
  }) {
    try {
      const client = this.supabaseService.getClient();
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const status = params?.status || 'Published';

      // Requête avec relations
      let query = client
        .from('articles')
        .select(`
          *,
          categories_cms!articles_category_id_fkey(*),
          article_tags(
            tags(*)
          )
        `, { count: 'exact' })
        .eq('status', status)
        .order('published_at', { ascending: false });

      // Filtre par catégorie
      if (params?.categorySlug) {
        // Récupérer d'abord la catégorie par slug
        const { data: categoryData } = await client
          .from('categories_cms')
          .select('id')
          .eq('slug', params.categorySlug)
          .single();

        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        } else {
          // Aucune catégorie trouvée
          return {
            data: [],
            meta: {
              pagination: {
                page,
                pageSize,
                total: 0,
                pageCount: 0,
              },
            },
          };
        }
      }

      // Filtre par tag (via la table de liaison)
      if (params?.tagSlug) {
        // On doit faire une sous-requête pour les tags
        const { data: tagData } = await client
          .from('tags')
          .select('id')
          .eq('slug', params.tagSlug)
          .single();

        if (tagData) {
          const { data: articleTags } = await client
            .from('article_tags')
            .select('article_id')
            .eq('tag_id', tagData.id);

          if (articleTags && articleTags.length > 0) {
            const articleIds = articleTags.map((at: any) => at.article_id);
            query = query.in('id', articleIds);
          } else {
            // Aucun article avec ce tag
            return {
              data: [],
              meta: {
                pagination: {
                  page,
                  pageSize,
                  total: 0,
                  pageCount: 0,
                },
              },
            };
          }
        }
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Erreur Supabase articles:', error);
        throw new HttpException(
          `Erreur lors de la récupération des articles: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log(`✅ ${data?.length || 0} articles récupérés depuis Supabase`);

      return {
        data: (data || []).map((item: any) => {
          try {
            return this.mapArticleWithRelations(item);
          } catch (mapError: any) {
            console.error('Erreur mapping article:', mapError, 'Data:', item);
            throw mapError;
          }
        }),
        meta: {
          pagination: {
            page,
            pageSize,
            total: count || 0,
            pageCount: Math.ceil((count || 0) / pageSize),
          },
        },
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des articles',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('articles')
        .select(`
          *,
          categories_cms!articles_category_id_fkey(*),
          article_tags(
            tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new HttpException(
          `Erreur lors de la récupération de l'article: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return data ? this.mapArticleWithRelations(data) : null;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de l\'article',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createArticle(articleData: Partial<Article> & { tagIds?: string[] }): Promise<Article> {
    try {
      const client = this.supabaseService.getClient();
      const tagIds = articleData.tagIds || [];
      delete (articleData as any).tagIds;

      const insertData: any = {
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        excerpt: articleData.excerpt || null,
        featured_image: articleData.featuredImage || null,
        category_id: articleData.categoryId || null,
        status: articleData.status || 'Draft',
        author_id: articleData.authorId || null,
        meta_title: articleData.metaTitle || null,
        meta_description: articleData.metaDescription || null,
        meta_keywords: articleData.metaKeywords || null,
        views: articleData.views || 0,
        reading_time: articleData.readingTime || 0,
        published_at: articleData.publishedAt ? articleData.publishedAt.toISOString() : null,
        scheduled_at: articleData.scheduledAt ? articleData.scheduledAt.toISOString() : null,
      };

      const { data: article, error } = await client
        .from('articles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Erreur lors de la création de l'article: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Ajouter les tags
      if (tagIds.length > 0) {
        const articleTags = tagIds.map((tagId) => ({
          article_id: article.id,
          tag_id: tagId,
        }));

        await client.from('article_tags').insert(articleTags);
      }

      // Récupérer l'article avec ses relations
      return await this.findArticleById(article.id);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la création de l\'article',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateArticle(id: string, articleData: Partial<Article> & { tagIds?: string[] }): Promise<Article> {
    try {
      const client = this.supabaseService.getClient();
      const tagIds = articleData.tagIds;
      delete (articleData as any).tagIds;

      const updateData: any = {};
      
      if (articleData.title !== undefined) updateData.title = articleData.title;
      if (articleData.slug !== undefined) updateData.slug = articleData.slug;
      if (articleData.content !== undefined) updateData.content = articleData.content;
      if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
      if (articleData.featuredImage !== undefined) updateData.featured_image = articleData.featuredImage;
      if (articleData.categoryId !== undefined) updateData.category_id = articleData.categoryId;
      if (articleData.status !== undefined) updateData.status = articleData.status;
      if (articleData.metaTitle !== undefined) updateData.meta_title = articleData.metaTitle;
      if (articleData.metaDescription !== undefined) updateData.meta_description = articleData.metaDescription;
      if (articleData.metaKeywords !== undefined) updateData.meta_keywords = articleData.metaKeywords;
      if (articleData.publishedAt !== undefined) {
        updateData.published_at = articleData.publishedAt ? articleData.publishedAt.toISOString() : null;
      }
      if (articleData.scheduledAt !== undefined) {
        updateData.scheduled_at = articleData.scheduledAt ? articleData.scheduledAt.toISOString() : null;
      }

      const { error } = await client
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Erreur lors de la mise à jour de l'article: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Mettre à jour les tags si fournis
      if (tagIds !== undefined) {
        // Supprimer les anciens tags
        await client.from('article_tags').delete().eq('article_id', id);
        
        // Ajouter les nouveaux tags
        if (tagIds.length > 0) {
          const articleTags = tagIds.map((tagId) => ({
            article_id: id,
            tag_id: tagId,
          }));
          await client.from('article_tags').insert(articleTags);
        }
      }

      return await this.findArticleById(id);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la mise à jour de l\'article',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findArticleById(id: string): Promise<Article | null> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('articles')
        .select(`
          *,
          categories_cms!articles_category_id_fkey(*),
          article_tags(
            tags(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new HttpException(
          `Erreur lors de la récupération de l'article: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return data ? this.mapArticleWithRelations(data) : null;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de l\'article',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      // Les tags seront supprimés automatiquement grâce à CASCADE
      const { error } = await client
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Erreur lors de la suppression de l'article: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression de l\'article',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async incrementViews(id: string): Promise<Article> {
    try {
      const client = this.supabaseService.getClient();
      const article = await this.findArticleById(id);
      
      if (!article) {
        throw new HttpException('Article non trouvé', HttpStatus.NOT_FOUND);
      }

      const { error } = await client
        .from('articles')
        .update({ views: article.views + 1 })
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Erreur lors de l'incrémentation des vues: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return await this.findArticleById(id) as Article;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'incrémentation des vues',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========== CATEGORIES ==========

  async findAllCategories(): Promise<Category[]> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('categories_cms')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new HttpException(
          `Erreur lors de la récupération des catégories: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return (data || []).map((item: any) => this.mapCategory(item));
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des catégories',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('categories_cms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new HttpException(
          `Erreur lors de la récupération de la catégorie: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return data ? this.mapCategory(data) : null;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de la catégorie',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('categories_cms')
        .insert({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || null,
          color: categoryData.color || null,
        })
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Erreur lors de la création de la catégorie: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return this.mapCategory(data);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la création de la catégorie',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========== TAGS ==========

  async findAllTags(): Promise<Tag[]> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new HttpException(
          `Erreur lors de la récupération des tags: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return (data || []).map((item: any) => this.mapTag(item));
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des tags',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findTagBySlug(slug: string): Promise<Tag | null> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new HttpException(
          `Erreur lors de la récupération du tag: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return data ? this.mapTag(data) : null;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération du tag',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('tags')
        .insert({
          name: tagData.name,
          slug: tagData.slug,
        })
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Erreur lors de la création du tag: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return this.mapTag(data);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la création du tag',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========== RESSOURCES ==========

  async findAllResources(page = 1, pageSize = 10, type?: string) {
    try {
      const client = this.supabaseService.getClient();
      let query = client
        .from('resources')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Erreur Supabase resources:', error);
        throw new HttpException(
          `Erreur lors de la récupération des ressources: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log(`✅ ${data?.length || 0} ressources récupérées depuis Supabase`);

      return {
        data: (data || []).map((item: any) => this.mapResource(item)),
        meta: {
          pagination: {
            page,
            pageSize,
            total: count || 0,
            pageCount: Math.ceil((count || 0) / pageSize),
          },
        },
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des ressources',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findResourceBySlug(slug: string): Promise<Resource | null> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('resources')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new HttpException(
          `Erreur lors de la récupération de la ressource: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return data ? this.mapResource(data) : null;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de la ressource',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async incrementDownloadCount(id: string): Promise<Resource> {
    try {
      const client = this.supabaseService.getClient();
      const resource = await this.findResourceBySlug(id);
      
      if (!resource) {
        // Essayer avec l'ID directement
        const { data: resourceData } = await client
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();

        if (!resourceData) {
          throw new HttpException('Ressource non trouvée', HttpStatus.NOT_FOUND);
        }

        const currentCount = resourceData.download_count || 0;
        const { data, error } = await client
          .from('resources')
          .update({ download_count: currentCount + 1 })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new HttpException(
            `Erreur lors de l'incrémentation du compteur: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }

        return this.mapResource(data);
      }

      const currentCount = resource.downloadCount;
      const { data, error } = await client
        .from('resources')
        .update({ download_count: currentCount + 1 })
        .eq('id', resource.id)
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Erreur lors de l'incrémentation du compteur: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return this.mapResource(data);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'incrémentation du compteur',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createResource(resourceData: Partial<Resource>): Promise<Resource> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('resources')
        .insert({
          title: resourceData.title,
          slug: resourceData.slug,
          description: resourceData.description || null,
          file_url: resourceData.fileUrl,
          type: resourceData.type || 'PDF',
          download_count: 0,
          published_at: resourceData.publishedAt ? resourceData.publishedAt.toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Erreur lors de la création de la ressource: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return this.mapResource(data);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erreur lors de la création de la ressource',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========== MAPPERS ==========

  private mapArticleWithRelations(data: any): Article {
    // Gérer les deux formats possibles de catégorie
    const categoryData = data.categories_cms || data.category;
    const category = categoryData ? this.mapCategory(categoryData) : undefined;
    
    // Gérer les tags (peuvent être dans article_tags ou directement)
    let tags: Tag[] = [];
    if (data.article_tags && Array.isArray(data.article_tags)) {
      tags = data.article_tags
        .map((at: any) => {
          const tagData = at.tags || at.tag;
          return tagData ? this.mapTag(tagData) : null;
        })
        .filter((t: Tag | null) => t !== null) as Tag[];
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featured_image,
      categoryId: data.category_id,
      category,
      tags,
      status: data.status,
      authorId: data.author_id,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      metaKeywords: data.meta_keywords,
      views: data.views || 0,
      readingTime: data.reading_time || 0,
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapCategory(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapTag(data: any): Tag {
    if (!data) return null as any;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapResource(data: any): Resource {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      fileUrl: data.file_url,
      type: data.type,
      downloadCount: data.download_count || 0,
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
