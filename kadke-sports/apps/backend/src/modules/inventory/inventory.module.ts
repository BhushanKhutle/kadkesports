import { Module, Body, Controller, Get, Param, Patch, UseGuards, Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/public.decorator';

class UpdateStockDto { @IsInt() @Min(0) stock: number; }

@Injectable()
class InventoryService {
  constructor(private prisma: PrismaService) {}
  list() {
    return this.prisma.inventory.findMany({
      include: { product: { select: { name: true, sku: true, images: true } } },
      orderBy: { stock: 'asc' },
    });
  }
  byProduct(productId: string) {
    return this.prisma.inventory.findUnique({ where: { productId } });
  }
  update(productId: string, stock: number) {
    return this.prisma.inventory.upsert({
      where: { productId }, create: { productId, stock }, update: { stock },
    });
  }
  lowStock() {
    return this.prisma.inventory.findMany({
      where: { stock: { lte: this.prisma.inventory.fields.lowStockAt as any } },
      include: { product: true },
    }).catch(() => this.prisma.inventory.findMany({
      where: { stock: { lte: 5 } }, include: { product: true },
    }));
  }
}

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('inventory')
class InventoryController {
  constructor(private svc: InventoryService) {}
  @Get() list() { return this.svc.list(); }
  @Get('low-stock') low() { return this.svc.lowStock(); }
  @Get(':productId') one(@Param('productId') p: string) { return this.svc.byProduct(p); }
  @Patch(':productId') update(@Param('productId') p: string, @Body() d: UpdateStockDto) {
    return this.svc.update(p, d.stock);
  }
}

@Module({ controllers: [InventoryController], providers: [InventoryService] })
export class InventoryModule {}
