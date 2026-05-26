import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        roleId: true,
        isActive: true,
        avatarUrl: true,
        customRole: {
          select: { id: true, name: true, permissions: true, isActive: true },
        },
      },
    });

    if (!user || !user.isActive) return null;

    // If user has a customRole but it's deactivated, treat as no custom role
    if (user.customRole && !user.customRole.isActive) {
      return { ...user, customRole: null };
    }

    return user;
  }
}
