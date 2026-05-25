import { Injectable, NotFoundException } from '@nestjs/common';
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
}
