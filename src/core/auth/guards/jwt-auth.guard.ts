import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
    this.logger.log('JWT Auth Guard initialized');
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(
      `Authenticating request to: ${request.method} ${request.url}`,
    );

    return super.canActivate(context);
  }

  override handleRequest(err: any, user: any, info: any) {
    if (info instanceof Error) {
      this.logger.error(`Authentication error: ${info.message}`);
      throw new UnauthorizedException(info.message);
    }

    if (err) {
      this.logger.error('Authentication error:', err);
      throw err;
    }

    if (!user) {
      this.logger.warn('Authentication failed: No user found');
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.log(`Successfully authenticated user: ${user.email}`);
    this.logger.debug(`User details: ${JSON.stringify(user)}`);

    return user;
  }
}
