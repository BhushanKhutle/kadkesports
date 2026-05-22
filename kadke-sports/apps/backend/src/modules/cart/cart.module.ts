import { Module, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/public.decorator';

class AddCartItemDto {
  @IsString() productId: string;
  @IsInt() @Min(1) quantity: number;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;
}
class UpdateQtyDto { @IsInt() @Min(1) quantity: number; }

@Injectable()
class CartService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { inventory: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const subtotal = items.reduce((acc, i) => {
      const p = i.product;
      const discount = Number(p.discount) || 0;
      const price = Number(p.price) * (1 - discount / 100);
      return acc + price * i.quantity;
    }, 0);
    return { items, subtotal, count: items.reduce((a, i) => a + i.quantity, 0) };
  }

  async add(userId: string, d: AddCartItemDto) {
    const prod = await this.prisma.product.findUnique({ where: { id: d.productId }, include: { inventory: true } });
    if (!prod) throw new NotFoundException('Product not found');
    if (prod.inventory && prod.inventory.stock < d.quantity) throw new BadRequestException('Insufficient stock');

    return this.prisma.cartItem.upsert({
      where: { userId_productId_size_color: { userId, productId: d.productId, size: d.size ?? '', color: d.color ?? '' } } as any,
      update: { quantity: { increment: d.quantity } },
      create: { userId, productId: d.productId, quantity: d.quantity, size: d.size, color: d.color },
      include: { product: true },
    });
  }

  async updateQty(userId: string, id: string, qty: number) {
    return this.prisma.cartItem.update({ where: { id, userId } as any, data: { quantity: qty } });
  }

  remove(userId: string, id: string) { return this.prisma.cartItem.delete({ where: { id, userId } as any }); }
  clear(userId: string) { return this.prisma.cartItem.deleteMany({ where: { userId } }); }
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
class CartController {
  constructor(private svc: CartService) {}
  @Get() get(@CurrentUser() u: any) { return this.svc.get(u.id); }
  @Post('items') add(@CurrentUser() u: any, @Body() d: AddCartItemDto) { return this.svc.add(u.id, d); }
  @Patch('items/:id') update(@CurrentUser() u: any, @Param('id') id: string, @Body() d: UpdateQtyDto) { return this.svc.updateQty(u.id, id, d.quantity); }
  @Delete('items/:id') remove(@CurrentUser() u: any, @Param('id') id: string) { return this.svc.remove(u.id, id); }
  @Delete() clear(@CurrentUser() u: any) { return this.svc.clear(u.id); }
}

@Module({ controllers: [CartController], providers: [CartService], exports: [CartService] })
export class CartModule {}
export { CartService };
