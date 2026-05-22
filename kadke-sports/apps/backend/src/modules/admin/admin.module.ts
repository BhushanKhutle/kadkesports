import { Module, Controller, Get, UseGuards, Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/public.decorator';

@Injectable()
class AdminService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalProducts, totalOrders,
      paidOrders, pendingOrders,
      revenueAgg, recentOrders, lowStock,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.SUCCESS } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.SUCCESS, createdAt: { gte: since30 } },
        _sum: { total: true }, _count: true,
      }),
      this.prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.inventory.findMany({
        where: { stock: { lte: 10 } }, take: 10,
        include: { product: { select: { name: true, sku: true } } },
      }),
    ]);

    const dailyRevenue = await this.prisma.$queryRaw<Array<{ day: string; revenue: number }>>`
      SELECT TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
             COALESCE(SUM(total), 0)::float AS revenue
      FROM "Order"
      WHERE "paymentStatus" = 'SUCCESS' AND "createdAt" >= ${since7}
      GROUP BY day ORDER BY day ASC;
    `;

    return {
      counts: { totalUsers, totalProducts, totalOrders, paidOrders, pendingOrders },
      revenue30d: Number(revenueAgg._sum.total ?? 0),
      orders30d: revenueAgg._count,
      dailyRevenue,
      recentOrders,
      lowStock,
    };
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
class AdminController {
  constructor(private svc: AdminService) {}
  @Get('dashboard') dashboard() { return this.svc.dashboard(); }
}

@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}
