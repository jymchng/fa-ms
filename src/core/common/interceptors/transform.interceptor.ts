import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: {
    timestamp: string;
    path: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // If data is null or undefined, throw BadRequestException
        if (data === null || data === undefined) {
          throw new BadRequestException('Invalid request parameters');
        }

        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
      }),
      catchError((err) => throwError(() => err)),
    );
  }
}
