import { Module, Body, Controller, Delete, Get, Param, Post, UseGuards, Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/public.decorator';

class AddDto { @IsString() productId: string; }

@Injectable()
class WishlistService {
  constructor(private prisma: PrismaService) {}
  list(userId: string) {
    return this.prisma.wishlistItem.findMany({ where: { userId }, include: { product: true } });
  }
  add(userId: string, productId: string) {
    return this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
  }
  remove(userId: string, productId: string) {
    return this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }
}

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
class WishlistController {
  constructor(private svc: WishlistService) {}
  @Get() list(@CurrentUser() u: any) { return this.svc.list(u.id); }
  @Post() add(@CurrentUser() u: any, @Body() d: AddDto) { return this.svc.add(u.id, d.productId); }
  @Delete(':productId') remove(@CurrentUser() u: any, @Param('productId') p: string) { return this.svc.remove(u.id, p); }
}

@Module({ controllers: [WishlistController], providers: [WishlistService] })
export class WishlistModule {}
