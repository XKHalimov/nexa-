import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, firstName: string, lastName: string) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ForbiddenException('Profil allaqachon mavjud');
    }

    const profile = await this.prisma.profile.create({
      data: {
        userId,
        firstName,
        lastName,
      },
    });

    return {
      message: 'Profil yaratildi',
      profile,
    };
  }

  async getAllProfiles() {
    return this.prisma.profile.findMany({
      where: { isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new NotFoundException('userId topilmadi yoki token yaroqsiz');
    }

    const profile = await this.prisma.profile.findFirst({
      where: { userId },
    });

    if (!profile || profile.isDeleted) {
      throw new NotFoundException('Profil topilmadi');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profil topilmadi');

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: dto.firstName ?? profile.firstName,
        lastName: dto.lastName ?? profile.lastName,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Profil yangilandi',
      profile: updated,
    };
  }

  async softDeleteProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) throw new NotFoundException('Profil topilmadi');

    await this.prisma.profile.update({
      where: { userId },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    return { message: 'Profil muvaffaqiyatli o‘chirildi (soft delete)' };
  }
}
