import { Injectable, OnModuleInit, OnModuleDestroy, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async setCurrentUser(userId: string) {
    if (!userId) return;
    await this.$executeRawUnsafe(
      `SELECT set_config('app.current_user_id', '${userId}', true);`
    );
  }
}
