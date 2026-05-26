import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        avatarUrl: true, emailVerified: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateProfile(id: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, phone: true, avatarUrl: true },
    });
  }

  listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  addAddress(userId: string, data: any) {
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  updateAddress(userId: string, addressId: string, data: any) {
    return this.prisma.address.update({ where: { id: addressId, userId } as any, data });
  }

  deleteAddress(userId: string, addressId: string) {
    return this.prisma.address.delete({ where: { id: addressId, userId } as any });
  }

  list(page = 1, limit = 20) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }

  async listAll(search?: string) {
    const where: any = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name:  { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, phone: true, role: true, roleId: true,
        isActive: true, emailVerified: true, createdAt: true,
        customRole: { select: { id: true, name: true, permissions: true } },
        _count: { select: { orders: true } },
      },
    });
  }

  async createStaff(dto: { email: string; name: string; password: string; role: Role; phone?: string; roleId?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (existing) throw new BadRequestException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        password: hashed,
        role: dto.role,
        phone: dto.phone,
        roleId: dto.roleId,
        emailVerified: true,
        isActive: true,
      },
      select: {
        id: true, email: true, name: true, phone: true, role: true, roleId: true,
        isActive: true, createdAt: true,
      },
    });
  }

  async adminUpdate(id: string, dto: { name?: string; phone?: string; role?: Role; roleId?: string; isActive?: boolean }, currentAdminId: string) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');

    // Self-protection: admin cannot demote or disable themselves
    if (id === currentAdminId) {
      if (dto.role && dto.role !== 'ADMIN') throw new ForbiddenException('Cannot change your own role');
      if (dto.isActive === false) throw new ForbiddenException('Cannot deactivate yourself');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, email: true, name: true, phone: true, role: true, roleId: true,
        isActive: true, createdAt: true,
        customRole: { select: { id: true, name: true } },
      },
    });
  }

  async deactivate(id: string, currentAdminId: string) {
    if (id === currentAdminId) throw new ForbiddenException('Cannot deactivate yourself');
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  }

}
