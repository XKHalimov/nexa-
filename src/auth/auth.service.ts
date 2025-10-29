import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Email topilmadi');

    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (profile?.isDeleted) {
      throw new UnauthorizedException(
        'Profil o‘chirilgan. Kirish mumkin emas.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Parol xato');

    const payload = { sub: user.id, email: user.email, role: user.role };

    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return {
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      access_token: token,
    };
  }

  async signUp(dto: SignUpDto) {
    const { email, password, firstName, lastName } = dto;
    const hashed = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashed,
          firstName,
          lastName,
          username: email.split('@')[0],
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
      });

      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = await this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      });

      return {
        message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Bu email allaqachon mavjud!');
      }
      throw new InternalServerErrorException('Server xatosi');
    }
  }
}
