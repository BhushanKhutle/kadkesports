import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './products.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public, Roles } from '../../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filters, search, pagination' })
  list(@Query() q: ProductQueryDto) {
    return this.products.findAll(q);
  }

  @Public()
  @Get('featured')
  featured() {
    return this.products.findAll({ featured: true, limit: 8 } as any);
  }

  @Public()
  @Get('new-arrivals')
  newArrivals() {
    return this.products.newArrivals();
  }

  @Public()
  @Get('top-rated')
  topRated() {
    return this.products.topRated();
  }

  @Public()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.products.related(slug);
  }

  // ─── Admin ─────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
