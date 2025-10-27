import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SetCurrentUserMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    if (req.user?.id) {
      await this.prisma.setCurrentUser(req.user.id);
    }
    next();
  }
}
