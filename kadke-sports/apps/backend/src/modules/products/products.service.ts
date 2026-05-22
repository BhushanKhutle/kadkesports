import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './products.dto';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (q.q) {
      where.OR = [
        { name: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
        { brand: { contains: q.q, mode: 'insensitive' } },
        { tags: { has: q.q.toLowerCase() } },
      ];
    }
    if (q.category) where.category = { slug: q.category };
    if (q.brand) where.brand = { equals: q.brand, mode: 'insensitive' };
    if (q.featured !== undefined) where.featured = q.featured;
    if (q.minPrice || q.maxPrice) {
      where.price = {};
      if (q.minPrice) (where.price as any).gte = q.minPrice;
      if (q.maxPrice) (where.price as any).lte = q.maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === 'price-asc' ? { price: 'asc' }
      : q.sort === 'price-desc' ? { price: 'desc' }
      : q.sort === 'rating' ? { rating: 'desc' }
      : { createdAt: 'desc' };

    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(60, Number(q.limit) || 20);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, inventory: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        inventory: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async related(slug: string, limit = 8) {
    const prod = await this.prisma.product.findUnique({ where: { slug } });
    if (!prod) return [];
    return this.prisma.product.findMany({
      where: { categoryId: prod.categoryId, slug: { not: slug }, isActive: true },
      take: limit,
      orderBy: { rating: 'desc' },
      include: { category: true },
    });
  }

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.name) + '-' + Date.now().toString(36);
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        shortDesc: dto.shortDesc,
        brand: dto.brand,
        sku: dto.sku,
        categoryId: dto.categoryId,
        price: dto.price,
        discount: dto.discount ?? 0,
        images: dto.images ?? [],
        sizes: dto.sizes ?? [],
        colors: dto.colors ?? [],
        tags: dto.tags ?? [],
        featured: dto.featured ?? false,
        metaTitle: dto.metaTitle,
        metaDesc: dto.metaDesc,
        inventory: { create: { stock: dto.stock ?? 0 } },
      },
      include: { inventory: true, category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const { stock, ...rest } = dto;
    const data: any = { ...rest };
    if (stock !== undefined) {
      data.inventory = { upsert: { create: { stock }, update: { stock } } };
    }
    return this.prisma.product.update({ where: { id }, data, include: { inventory: true } });
  }

  remove(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  topRated(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
      take: limit,
      include: { category: true },
    });
  }

  newArrivals(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { category: true },
    });
  }
}
