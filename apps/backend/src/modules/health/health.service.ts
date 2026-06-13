import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  getHealth() {
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}