import { Module, Body, Controller, Get, Param, Post, Query, UseGuards, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CouponsModule, CouponsService } from '../coupons/coupons.module';
import { CartModule, CartService } from '../cart/cart.module';
import { CurrentUser, Roles } from '../../common/decorators/public.decorator';

class CreateOrderDto {
  @IsString() addressId: string;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsOptional() @IsString() couponCode?: string;
  @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private coupons: CouponsService,
  ) {}

  private genOrderNumber() {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KS-${ts}-${rnd}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cart.get(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    // Calculate
    let subtotal = 0;
    const lineItems = cart.items.map((i) => {
      const price = Number(i.product.price) * (1 - Number(i.product.discount) / 100);
      subtotal += price * i.quantity;
      return {
        productId: i.productId,
        name: i.product.name,
        sku: i.product.sku,
        price: Math.round(price * 100) / 100,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.product.images?.[0] ?? null,
      };
    });

    let discount = 0;
    if (dto.couponCode) {
      const applied = await this.coupons.apply(dto.couponCode, subtotal);
      discount = applied.discount;
    }
    const shipping = subtotal > 1999 ? 0 : 99;
    const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100; // 18% GST
    const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    // Stock check + decrement (transaction)
    return this.prisma.$transaction(async (tx) => {
      for (const it of cart.items) {
        const inv = it.product.inventory;
        if (!inv || inv.stock < it.quantity) {
          throw new BadRequestException(`Out of stock: ${it.product.name}`);
        }
        await tx.inventory.update({
          where: { productId: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: this.genOrderNumber(),
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode: dto.couponCode,
          notes: dto.notes,
          items: { create: lineItems },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    });
  }

  async listMine(userId: string, page = 1, limit = 10) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, payment: true, address: true },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  async one(userId: string, orderNumber: string) {
    const o = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, payment: true, address: true, user: { select: { name: true, email: true } } },
    });
    if (!o) throw new NotFoundException('Order not found');
    if (o.userId !== userId) throw new NotFoundException('Order not found');
    return o;
  }

  async listAll(page = 1, limit = 20, status?: OrderStatus) {
    const where = status ? { status } : {};
    return this.prisma.order.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: true },
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    const extras: any = {};
    if (status === OrderStatus.SHIPPED) extras.shippedAt = new Date();
    if (status === OrderStatus.DELIVERED) extras.deliveredAt = new Date();
    if (status === OrderStatus.CANCELLED) extras.cancelledAt = new Date();
    return this.prisma.order.update({ where: { id }, data: { status, ...extras } });
  }
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
class OrdersController {
  constructor(private svc: OrdersService) {}
  @Post() create(@CurrentUser() u: any, @Body() d: CreateOrderDto) { return this.svc.create(u.id, d); }
  @Get('my') mine(@CurrentUser() u: any, @Query('page') page = 1) { return this.svc.listMine(u.id, Number(page)); }
  @Get(':orderNumber') one(@CurrentUser() u: any, @Param('orderNumber') n: string) { return this.svc.one(u.id, n); }
  // Admin
  @Roles(Role.ADMIN) @Get() all(@Query('page') page = 1, @Query('status') status?: OrderStatus) {
    return this.svc.listAll(Number(page), 20, status);
  }
  @Roles(Role.ADMIN) @Post(':id/status') updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.svc.updateStatus(id, status);
  }
}

@Module({
  imports: [CartModule, CouponsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
