import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => d ?? 'secret' } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws conflict when email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({ email: 'x@y.com', password: 'Pass@123', name: 'X' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and issues tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'x@y.com', name: 'X', role: 'USER' });
      prisma.refreshToken.create.mockResolvedValue({});
      const r = await service.register({ email: 'x@y.com', password: 'Pass@123', name: 'X' } as any);
      expect(r.accessToken).toBe('signed-token');
      expect(r.user.email).toBe('x@y.com');
    });
  });

  describe('login', () => {
    it('rejects bad password', async () => {
      const hash = await bcrypt.hash('right', 12);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'x@y.com', password: hash, isActive: true, role: 'USER', name: 'X' });
      await expect(
        service.login({ email: 'x@y.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
