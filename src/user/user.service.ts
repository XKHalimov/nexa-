import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateUuid(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format.');
    }
  }

  async searchUsersRpc(searchTerm: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          isDeleted: false,
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
        },
        take: 20,
      });

      return {
        success: true,
        users,
      };
    } catch (error: any) {
      this.logger.error(`searchUsersRpc error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('User search failed.');
    }
  }

  async softDeleteUser(userId: string) {
    try {
      this.validateUuid(userId);

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      });

      return {
        success: true,
        message: 'User soft deleted successfully.',
        user,
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      this.logger.error(`softDeleteUser error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Soft delete failed.');
    }
  }

  async updateRole(userId: string, role: 'admin' | 'user') {
    try {
      this.validateUuid(userId);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      return {
        success: true,
        message: `User role updated to ${role} successfully.`,
        user: updatedUser,
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      this.logger.error(`updateRole error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Role update failed.');
    }
  }
}
