import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { Categorie } from '../common/types/database.types';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createCategorieDto: CreateCategorieDto): Promise<Categorie> {
    return this.supabase.createCategorie(createCategorieDto);
  }

  async findAll(): Promise<Categorie[]> {
    try {
      console.log('📋 CategoriesService.findAll() appelé');
      const categories = await this.supabase.findCategories();
      console.log(`📋 CategoriesService.findAll() - ${categories.length} catégorie(s) retournée(s)`);
      return categories;
    } catch (error: any) {
      console.error('❌ CategoriesService.findAll() - Erreur:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Categorie> {
    const categorie = await this.supabase.findCategorieById(id);
    if (!categorie) {
      throw new NotFoundException(`Categorie with ID "${id}" not found`);
    }
    return categorie;
  }

  async update(id: string, updateCategorieDto: UpdateCategorieDto): Promise<Categorie> {
    await this.findOne(id); // Check if exists
    return this.supabase.updateCategorie(id, updateCategorieDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.supabase.deleteCategorie(id);
  }
}

