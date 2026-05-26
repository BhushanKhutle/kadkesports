import { Module, Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Injectable, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouponType, Role } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/public.decorator';

class CreateCouponDto {
  @IsString() code: string;
  @IsEnum(CouponType) type: CouponType;
  @IsNumber() value: number;
  @IsOptional() @IsNumber() minOrder?: number;
  @IsOptional() @IsNumber() maxDiscount?: number;
  @IsOptional() @IsNumber() usageLimit?: number;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class UpdateCouponDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsEnum(CouponType) type?: CouponType;
  @IsOptional() @IsNumber() value?: number;
  @IsOptional() @IsNumber() minOrder?: number;
  @IsOptional() @IsNumber() maxDiscount?: number;
  @IsOptional() @IsNumber() usageLimit?: number;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class ApplyDto { @IsString() code: string; @IsNumber() subtotal: number; }

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async one(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Coupon not found');
    return c;
  }

  async create(d: CreateCouponDto) {
    const code = d.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new BadRequestException(`Coupon code "${code}" already exists`);
    const data: any = {
      code,
      type: d.type,
      value: d.value,
      minOrder: d.minOrder ?? 0,
      maxDiscount: d.maxDiscount,
      usageLimit: d.usageLimit,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      isActive: d.isActive ?? true,
    };
    return this.prisma.coupon.create({ data });
  }

  async update(id: string, d: UpdateCouponDto) {
    await this.one(id);
    const data: any = { ...d };
    if (d.code) data.code = d.code.toUpperCase().trim();
    if (d.expiresAt !== undefined) data.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.one(id);
    return this.prisma.coupon.update({ where: { id }, data: { isActive: false } });
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) @RequirePermission('coupons.view') @ApiBearerAuth() @Get()
  list() { return this.svc.list(); }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) @RequirePermission('coupons.view') @ApiBearerAuth() @Get(':id')
  one(@Param('id') id: string) { return this.svc.one(id); }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) @RequirePermission('coupons.create') @ApiBearerAuth() @Post()
  create(@Body() d: CreateCouponDto) { return this.svc.create(d); }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) @RequirePermission('coupons.edit') @ApiBearerAuth() @Patch(':id')
  update(@Param('id') id: string, @Body() d: UpdateCouponDto) { return this.svc.update(id, d); }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) @RequirePermission('coupons.delete') @ApiBearerAuth() @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

@Module({ controllers: [CouponsController], providers: [CouponsService], exports: [CouponsService] })
export class CouponsModule {}
