// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // role kerak bo‘lmasa, barcha kirishi mumkin

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Bu yerda JWT auth orqali userni olamiz deb hisoblaymiz

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Sizda ruxsat yo‘q');
    }

    return true;
  }
}
