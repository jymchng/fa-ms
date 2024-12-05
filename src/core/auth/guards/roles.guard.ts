import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {
    this.logger.log('Roles Guard initialized');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Required roles for this route: ${requiredRoles?.join(', ') || 'none'}`);

    if (!requiredRoles) {
      this.logger.debug('No roles required for this route');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    this.logger.debug(`Checking administrator status for user: ${user.email}`);

    // Check if user is an administrator in the database
    const administrator = await this.prisma.administrator.findUnique({
      where: {
        email: user.email
      }
    });

    const isAdmin = !!administrator;
    
    if (isAdmin) {
      this.logger.log(`Access granted to administrator: ${user.email}`);
      return true;
    }

    this.logger.warn(`Access denied: ${user.email} is not an administrator`);
    return false;
  }
}
