import { Role } from '@prisma/client';

export function buildRegionFilter(user: any, query?: any) {
  const where: any = {};

  if (user.role === Role.REGION_ADMIN) {
    where.regionId = user.regionId;
  } else if (user.role === Role.DISTRICT_ADMIN) {
    where.regionId = user.regionId;
    where.districtId = user.districtId;
  } else if (user.role === Role.MAHALLA_LEADER) {
    where.regionId = user.regionId;
    where.districtId = user.districtId;
    where.mahallaId = user.mahallaId;
  }

  if (query?.regionId) where.regionId = query.regionId;
  if (query?.districtId) where.districtId = query.districtId;
  if (query?.mahallaId) where.mahallaId = query.mahallaId;

  return where;
}
