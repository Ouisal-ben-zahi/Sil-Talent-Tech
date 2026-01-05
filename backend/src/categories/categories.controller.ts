import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { Public } from '../common/decorators/public.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {
    console.log('✅ CategoriesController initialisé - Route: GET /api/categories');
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createCategorieDto: CreateCategorieDto) {
    return this.categoriesService.create(createCategorieDto);
  }

  @Get()
  @Public()
  findAll() {
    console.log('📋 GET /api/categories - findAll() appelé');
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateCategorieDto: UpdateCategorieDto) {
    return this.categoriesService.update(id, updateCategorieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

