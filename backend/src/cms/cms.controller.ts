import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Res,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CmsService } from './cms.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('cms')
export class CmsController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Articles - Public
  @Get('articles')
  async getArticles(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('categorySlug') categorySlug?: string,
    @Query('tagSlug') tagSlug?: string,
    @Query('status') status?: 'Draft' | 'Published',
  ) {
    try {
      const result = await this.cmsService.findAllArticles({
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10,
        categorySlug,
        tagSlug,
        status: status || 'Published',
      });
      console.log(`📊 API: ${result.data.length} articles retournés`);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur dans getArticles:', error);
      throw error;
    }
  }

  @Get('articles/images/:fileName')
  async getArticleImage(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      const client = this.supabaseService.getClient();
      
      // Télécharger l'image depuis Supabase Storage
      const { data, error } = await client.storage
        .from('articles_imgs')
        .download(fileName);

      if (error || !data) {
        throw new HttpException(`Image ${fileName} non trouvée`, HttpStatus.NOT_FOUND);
      }

      // Convertir le Blob en Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Déterminer le type MIME
      const extension = fileName.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      const contentType = mimeTypes[extension || ''] || 'image/jpeg';

      // Retourner l'image
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
      res.send(buffer);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erreur lors de la récupération de l'image: ${error.message}`);
    }
  }

  @Get('articles/:slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    const article = await this.cmsService.findArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article non trouvé', HttpStatus.NOT_FOUND);
    }
    return article;
  }

  @Post('articles/:id/views')
  async incrementViews(@Param('id') id: string) {
    return this.cmsService.incrementViews(id);
  }

  // Articles - Admin
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('articles')
  async createArticle(@Body() articleData: CreateArticleDto) {
    return this.cmsService.createArticle(articleData);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('articles/:id')
  async updateArticle(@Param('id') id: string, @Body() articleData: Partial<CreateArticleDto>) {
    return this.cmsService.updateArticle(id, articleData);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('articles/:id')
  async deleteArticle(@Param('id') id: string) {
    await this.cmsService.deleteArticle(id);
    return { message: 'Article supprimé avec succès' };
  }

  // Ressources - Public
  @Get('resources')
  async getResources(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('type') type?: string,
  ) {
    try {
      const result = await this.cmsService.findAllResources(
        page ? Number(page) : 1,
        pageSize ? Number(pageSize) : 10,
        type,
      );
      console.log(`📊 API: ${result.data.length} ressources retournées`);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur dans getResources:', error);
      throw error;
    }
  }

  @Get('resources/:slug')
  async getResourceBySlug(@Param('slug') slug: string) {
    const resource = await this.cmsService.findResourceBySlug(slug);
    if (!resource) {
      throw new HttpException('Ressource non trouvée', HttpStatus.NOT_FOUND);
    }
    return resource;
  }

  @Get('resources/:id/download')
  async downloadResource(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    try {
      // Incrémenter le compteur de téléchargements
      const resource = await this.cmsService.incrementDownloadCount(id);
      
      console.log(`📥 Téléchargement de la ressource: ${resource.title} depuis ${resource.fileUrl}`);
      
      let fileBuffer: Buffer;
      let contentType: string;
      
      // Vérifier si c'est une URL locale (commence par /resources/)
      if (resource.fileUrl.startsWith('/resources/')) {
        // Fichier local dans le dossier public du frontend
        // Construire le chemin complet vers le fichier
        const frontendPath = path.join(process.cwd(), '..', 'frontend', 'public', resource.fileUrl);
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(frontendPath)) {
          throw new HttpException(
            `Fichier non trouvé: ${resource.fileUrl}`,
            HttpStatus.NOT_FOUND,
          );
        }
        
        // Lire le fichier local
        fileBuffer = fs.readFileSync(frontendPath);
        
        // Déterminer le type de contenu depuis l'extension
        const extension = path.extname(frontendPath).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.pdf': 'application/pdf',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.doc': 'application/msword',
          '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.xls': 'application/vnd.ms-excel',
        };
        contentType = contentTypes[extension] || 'application/octet-stream';
      } else {
        // URL externe - télécharger depuis l'URL
        const response = await firstValueFrom(
          this.httpService.get(resource.fileUrl, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 secondes de timeout
          }),
        );
        
        fileBuffer = Buffer.from(response.data);
        contentType = response.headers['content-type'] || 'application/octet-stream';
      }
      
      // Extraire le nom du fichier depuis l'URL ou utiliser le titre de la ressource
      const urlParts = resource.fileUrl.split('/');
      const fileNameFromUrl = urlParts[urlParts.length - 1].split('?')[0];
      const extension = fileNameFromUrl.includes('.') 
        ? '.' + fileNameFromUrl.split('.').pop() 
        : '';
      const fileName = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + extension;
      
      console.log(`✅ Fichier téléchargé, taille: ${fileBuffer.length} bytes, type: ${contentType}`);
      
      // Configurer les headers pour forcer le téléchargement
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Envoyer le fichier et terminer la réponse
      res.send(fileBuffer);
      res.end();
    } catch (error: any) {
      console.error('❌ Erreur lors du téléchargement de la ressource:', error);
      
      // Si c'est une erreur HTTP, renvoyer le statut approprié
      if (error.status) {
        res.status(error.status);
        res.json({
          success: false,
          message: error.message || 'Erreur lors du téléchargement',
        });
      } else if (error.response) {
        res.status(error.response.status || HttpStatus.INTERNAL_SERVER_ERROR);
        res.json({
          success: false,
          message: `Erreur lors du téléchargement: ${error.response.statusText || error.message}`,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
        res.json({
          success: false,
          message: `Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}`,
        });
      }
      res.end();
    }
  }

  // Ressources - Admin
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('resources')
  async createResource(@Body() resourceData: CreateResourceDto) {
    return this.cmsService.createResource(resourceData);
  }

  // Catégories - Public
  @Get('categories')
  async getCategories() {
    return this.cmsService.findAllCategories();
  }

  @Get('categories/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.cmsService.findCategoryBySlug(slug);
    if (!category) {
      throw new HttpException('Catégorie non trouvée', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  // Catégories - Admin
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('categories')
  async createCategory(@Body() categoryData: any) {
    return this.cmsService.createCategory(categoryData);
  }

  // Tags - Public
  @Get('tags')
  async getTags() {
    return this.cmsService.findAllTags();
  }

  @Get('tags/:slug')
  async getTagBySlug(@Param('slug') slug: string) {
    const tag = await this.cmsService.findTagBySlug(slug);
    if (!tag) {
      throw new HttpException('Tag non trouvé', HttpStatus.NOT_FOUND);
    }
    return tag;
  }

  // Tags - Admin
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('tags')
  async createTag(@Body() tagData: any) {
    return this.cmsService.createTag(tagData);
  }
}


