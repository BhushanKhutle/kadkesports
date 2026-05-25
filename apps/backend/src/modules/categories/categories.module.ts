import { Module } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public, Roles } from '../../common/decorators/public.decorator';

class CategoryDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() parentId?: string;
}

@Injectable()
class CategoriesService {
  constructor(private prisma: PrismaService) {}
  list() { return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }); }
  bySlug(slug: string) { return this.prisma.category.findUnique({ where: { slug }, include: { products: { take: 12 } } }); }
  create(d: CategoryDto) { return this.prisma.category.create({ data: d }); }
  update(id: string, d: Partial<CategoryDto>) { return this.prisma.category.update({ where: { id }, data: d }); }
  remove(id: string) { return this.prisma.category.update({ where: { id }, data: { isActive: false } }); }
}

@ApiTags('Categories')
@Controller('categories')
class CategoriesController {
  constructor(private svc: CategoriesService) {}
  @Public() @Get() list() { return this.svc.list(); }
  @Public() @Get(':slug') one(@Param('slug') s: string) { return this.svc.bySlug(s); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() @Post() create(@Body() d: CategoryDto) { return this.svc.create(d); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() @Patch(':id') update(@Param('id') id: string, @Body() d: Partial<CategoryDto>) { return this.svc.update(id, d); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}

@Module({ controllers: [CategoriesController], providers: [CategoriesService] })
export class CategoriesModule {}
