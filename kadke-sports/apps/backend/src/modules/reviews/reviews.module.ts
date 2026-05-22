import { Module, Body, Controller, Delete, Get, Param, Post, Query, UseGuards, Injectable, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators/public.decorator';

class CreateReviewDto {
  @IsString() productId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() title?: string;
  @IsString() body: string;
}

@Injectable()
class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async list(productId: string, page = 1, limit = 10) {
    const where = { productId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatarUrl: true } } },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  async create(userId: string, d: CreateReviewDto) {
    const exists = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: d.productId } },
    });
    if (exists) throw new BadRequestException('You already reviewed this product');

    // Check verified buyer
    const purchased = await this.prisma.orderItem.findFirst({
      where: { productId: d.productId, order: { userId, paymentStatus: 'SUCCESS' } },
    });

    const r = await this.prisma.review.create({
      data: { userId, productId: d.productId, rating: d.rating, title: d.title, body: d.body, verified: !!purchased },
    });

    // Recompute avg
    const agg = await this.prisma.review.aggregate({
      where: { productId: d.productId }, _avg: { rating: true }, _count: true,
    });
    await this.prisma.product.update({
      where: { id: d.productId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count },
    });

    return r;
  }

  remove(userId: string, id: string) {
    return this.prisma.review.deleteMany({ where: { id, userId } });
  }
}

@ApiTags('Reviews')
@Controller('reviews')
class ReviewsController {
  constructor(private svc: ReviewsService) {}
  @Public() @Get(':productId') list(@Param('productId') p: string, @Query('page') page = 1) {
    return this.svc.list(p, Number(page));
  }
  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post()
  create(@CurrentUser() u: any, @Body() d: CreateReviewDto) { return this.svc.create(u.id, d); }
  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Delete(':id')
  remove(@CurrentUser() u: any, @Param('id') id: string) { return this.svc.remove(u.id, id); }
}

@Module({ controllers: [ReviewsController], providers: [ReviewsService] })
export class ReviewsModule {}
