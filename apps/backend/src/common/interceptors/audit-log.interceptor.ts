import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    if (method === 'GET') return next.handle();

    const user = request.user;
    const path = request.route?.path || request.url;

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user?.id || null,
              action: `${method} ${path}`,
              entity: path.split('/').filter(Boolean)[1] || 'unknown',
              entityId: request.params?.id?.toString() || null,
              newValue: method !== 'DELETE' ? responseData?.data || null : null,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'] || null,
            },
          });
        } catch {}
      }),
    );
  }
}
