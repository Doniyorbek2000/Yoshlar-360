import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { region: true, district: true, mahalla: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash, ...userWithoutPassword } = user;
    return { ...tokens, user: userWithoutPassword };
  }

  async register(dto: RegisterDto, creatorRole: Role) {
    const allowedRoles: Record<string, Role[]> = {
      [Role.SUPER_ADMIN]: [Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN, Role.MAHALLA_LEADER, Role.MODERATOR, Role.YOUTH],
      [Role.REPUBLIC_ADMIN]: [Role.REGION_ADMIN, Role.DISTRICT_ADMIN, Role.MAHALLA_LEADER, Role.MODERATOR, Role.YOUTH],
      [Role.REGION_ADMIN]: [Role.DISTRICT_ADMIN, Role.MAHALLA_LEADER, Role.YOUTH],
      [Role.DISTRICT_ADMIN]: [Role.MAHALLA_LEADER, Role.YOUTH],
      [Role.MAHALLA_LEADER]: [Role.YOUTH],
    };

    if (!allowedRoles[creatorRole]?.includes(dto.role)) {
      throw new ForbiddenException('Bu rolni yaratish huquqi yo\'q');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new ConflictException('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan');
      }
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        regionId: dto.regionId,
        districtId: dto.districtId,
        mahallaId: dto.mahallaId,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token yaroqsiz');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
    await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Tizimdan muvaffaqiyatli chiqdingiz' };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { region: true, district: true, mahalla: true, youthProfile: true },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...result } = user;
    return result;
  }

  private async generateTokens(userId: number, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }
}
