import { Module, Body, Controller, Get, Param, Post, UseGuards, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouponType, Role } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/public.decorator';

class CreateCouponDto {
  @IsString() code: string;
  @IsEnum(CouponType) type: CouponType;
  @IsNumber() value: number;
  @IsOptional() @IsNumber() minOrder?: number;
  @IsOptional() @IsNumber() maxDiscount?: number;
  @IsOptional() @IsNumber() usageLimit?: number;
}
class ApplyDto { @IsString() code: string; @IsNumber() subtotal: number; }

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  list() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }
  create(d: CreateCouponDto) { return this.prisma.coupon.create({ data: { ...d, code: d.code.toUpperCase() } }); }

  async apply(code: string, subtotal: number) {
    const c = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!c || !c.isActive) throw new NotFoundException('Invalid coupon');
    if (c.expiresAt && c.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (c.usageLimit && c.usedCount >= c.usageLimit) throw new BadRequestException('Coupon usage exhausted');
    if (subtotal < Number(c.minOrder)) throw new BadRequestException(`Min order ₹${c.minOrder}`);

    let discount = c.type === CouponType.PERCENT
      ? (subtotal * Number(c.value)) / 100
      : Number(c.value);
    if (c.maxDiscount) discount = Math.min(discount, Number(c.maxDiscount));

    return { code: c.code, discount: Math.round(discount), type: c.type };
  }
}

@ApiTags('Coupons')
@Controller('coupons')
class CouponsController {
  constructor(private svc: CouponsService) {}
  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post('apply')
  apply(@Body() d: ApplyDto) { return this.svc.apply(d.code, d.subtotal); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() @Get()
  list() { return this.svc.list(); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() @Post()
  create(@Body() d: CreateCouponDto) { return this.svc.create(d); }
}

@Module({ controllers: [CouponsController], providers: [CouponsService], exports: [CouponsService] })
export class CouponsModule {}
