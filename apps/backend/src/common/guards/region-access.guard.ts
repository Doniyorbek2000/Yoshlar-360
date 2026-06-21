import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class RegionAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if ([Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN].includes(user.role)) return true;

    const regionId = parseInt(request.query.regionId || request.params.regionId || request.body?.regionId);
    const districtId = parseInt(request.query.districtId || request.params.districtId || request.body?.districtId);
    const mahallaId = parseInt(request.query.mahallaId || request.params.mahallaId || request.body?.mahallaId);

    if (user.role === Role.REGION_ADMIN) {
      return !regionId || regionId === user.regionId;
    }
    if (user.role === Role.DISTRICT_ADMIN) {
      return (!regionId || regionId === user.regionId) && (!districtId || districtId === user.districtId);
    }
    if (user.role === Role.MAHALLA_LEADER) {
      return (!regionId || regionId === user.regionId) &&
             (!districtId || districtId === user.districtId) &&
             (!mahallaId || mahallaId === user.mahallaId);
    }
    return true;
  }
}
