import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { YouthModule } from './modules/youth/youth.module';
import { AppealsModule } from './modules/appeals/appeals.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ImportsModule } from './modules/imports/imports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { RegionsModule } from './modules/regions/regions.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    YouthModule,
    AppealsModule,
    ProblemsModule,
    TasksModule,
    KpiModule,
    ReportsModule,
    ImportsModule,
    NotificationsModule,
    DashboardModule,
    AuditLogModule,
    RegionsModule,
    BroadcastModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
