import { Module, Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role as UserRole } from '@prisma/client';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/public.decorator';

class CreateRoleDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsArray() @IsString({ each: true }) permissions: string[];
}

class UpdateRoleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export const ALL_PERMISSIONS = [
  'orders.view', 'orders.update_status', 'orders.add_tracking', 'orders.refund', 'orders.cancel',
  'products.view', 'products.create', 'products.edit', 'products.delete',
  'coupons.view', 'coupons.create', 'coupons.edit', 'coupons.delete',
  'users.view', 'users.create', 'users.edit', 'users.change_role', 'users.delete',
  'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
  'settings.view', 'settings.edit',
  'dashboard.view_basic', 'dashboard.view_revenue',
];

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.customRole.findMany({
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { users: true } } },
    });
  }

  async one(id: string) {
    const r = await this.prisma.customRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!r) throw new NotFoundException('Role not found');
    return r;
  }

  async create(d: CreateRoleDto) {
    const name = d.name.trim().toUpperCase();
    const exists = await this.prisma.customRole.findUnique({ where: { name } });
    if (exists) throw new BadRequestException(`Role "${name}" already exists`);
    const valid = d.permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    return this.prisma.customRole.create({
      data: { name, description: d.description, permissions: valid },
    });
  }

  async update(id: string, d: UpdateRoleDto) {
    const existing = await this.one(id);
    if (existing.isSystem && (d.name || d.permissions)) {
      if (existing.name === 'ADMIN') {
        throw new BadRequestException('ADMIN role is protected and cannot be edited');
      }
    }
    const data: any = { ...d };
    if (d.name) data.name = d.name.trim().toUpperCase();
    if (d.permissions) data.permissions = d.permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    return this.prisma.customRole.update({ where: { id }, data });
  }

  async remove(id: string) {
    const r = await this.one(id);
    if (r.isSystem) throw new BadRequestException('System roles cannot be deleted');
    if (r._count.users > 0) {
      throw new BadRequestException(`Cannot delete role with ${r._count.users} users assigned`);
    }
    return this.prisma.customRole.delete({ where: { id } });
  }

  listPermissions() {
    return ALL_PERMISSIONS;
  }
}

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('roles')
class RolesController {
  constructor(private svc: RolesService) {}

  @Get() list() { return this.svc.list(); }
  @Get('permissions') permissions() { return this.svc.listPermissions(); }
  @Get(':id') one(@Param('id') id: string) { return this.svc.one(id); }
  @Post() create(@Body() d: CreateRoleDto) { return this.svc.create(d); }
  @Patch(':id') update(@Param('id') id: string, @Body() d: UpdateRoleDto) {
    return this.svc.update(id, d);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
