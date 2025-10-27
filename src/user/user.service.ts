import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

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

      return users;
    } catch (error) {
      this.logger.error(`searchUsersRpc error: ${error.message}`);
      throw new InternalServerErrorException('User search failed');
    }
  }

  async softDeleteUser(userId: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      });

      return user;
    } catch (error) {
      this.logger.error(`softDeleteUser error: ${error.message}`);
      throw new InternalServerErrorException('Soft delete failed');
    }
  }
  async updateRole(userId: string, role: 'admin' | 'user') {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
  
}
