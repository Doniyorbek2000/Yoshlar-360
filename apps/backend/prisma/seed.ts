import {
  PrismaClient,
  Role,
  Gender,
  EducationLevel,
  EmploymentStatus,
  SocialStatus,
  RiskLevel,
  AppealStatus,
  Priority,
  TaskStatus,
  ProblemStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clear existing data (respecting FK order) ──────────────────────
  await prisma.appealComment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.kpiRecord.deleteMany();
  await prisma.report.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.appeal.deleteMany();
  await prisma.youthProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mahalla.deleteMany();
  await prisma.district.deleteMany();
  await prisma.region.deleteMany();

  console.log('  Cleared existing data');

  // ── Regions (14 regions of Uzbekistan) ─────────────────────────────
  const regionsData = [
    { nameUz: 'Toshkent shahri', nameRu: 'Город Ташкент' },
    { nameUz: 'Toshkent viloyati', nameRu: 'Ташкентская область' },
    { nameUz: 'Samarqand viloyati', nameRu: 'Самаркандская область' },
    { nameUz: 'Buxoro viloyati', nameRu: 'Бухарская область' },
    { nameUz: "Farg'ona viloyati", nameRu: 'Ферганская область' },
    { nameUz: 'Andijon viloyati', nameRu: 'Андижанская область' },
    { nameUz: 'Namangan viloyati', nameRu: 'Наманганская область' },
    { nameUz: 'Qashqadaryo viloyati', nameRu: 'Кашкадарьинская область' },
    { nameUz: 'Surxondaryo viloyati', nameRu: 'Сурхандарьинская область' },
    { nameUz: 'Jizzax viloyati', nameRu: 'Джизакская область' },
    { nameUz: 'Sirdaryo viloyati', nameRu: 'Сырдарьинская область' },
    { nameUz: 'Navoiy viloyati', nameRu: 'Навоийская область' },
    { nameUz: 'Xorazm viloyati', nameRu: 'Хорезмская область' },
    {
      nameUz: "Qoraqalpog'iston Respublikasi",
      nameRu: 'Республика Каракалпакстан',
    },
  ];

  const regions: Record<string, Awaited<ReturnType<typeof prisma.region.create>>> = {};
  for (const r of regionsData) {
    regions[r.nameUz] = await prisma.region.create({ data: r });
  }
  console.log(`  Created ${Object.keys(regions).length} regions`);

  // ── Districts ──────────────────────────────────────────────────────
  const districtsData: { nameUz: string; nameRu: string; regionName: string }[] = [
    // Toshkent shahri (5 districts)
    { nameUz: 'Yunusobod tumani', nameRu: 'Юнусабадский район', regionName: 'Toshkent shahri' },
    { nameUz: "Mirzo Ulug'bek tumani", nameRu: 'Мирзо-Улугбекский район', regionName: 'Toshkent shahri' },
    { nameUz: 'Chilonzor tumani', nameRu: 'Чиланзарский район', regionName: 'Toshkent shahri' },
    { nameUz: 'Shayxontohur tumani', nameRu: 'Шайхантахурский район', regionName: 'Toshkent shahri' },
    { nameUz: 'Yakkasaroy tumani', nameRu: 'Яккасарайский район', regionName: 'Toshkent shahri' },
    // Samarqand viloyati (4 districts)
    { nameUz: 'Samarqand shahri', nameRu: 'Город Самарканд', regionName: 'Samarqand viloyati' },
    { nameUz: 'Urgut tumani', nameRu: 'Ургутский район', regionName: 'Samarqand viloyati' },
    { nameUz: "Kattaqo'rg'on tumani", nameRu: 'Каттакурганский район', regionName: 'Samarqand viloyati' },
    { nameUz: "Pastdarg'om tumani", nameRu: 'Пастдаргомский район', regionName: 'Samarqand viloyati' },
    // Farg'ona viloyati (4 districts)
    { nameUz: "Farg'ona shahri", nameRu: 'Город Фергана', regionName: "Farg'ona viloyati" },
    { nameUz: "Qo'qon shahri", nameRu: 'Город Коканд', regionName: "Farg'ona viloyati" },
    { nameUz: "Marg'ilon shahri", nameRu: 'Город Маргилан', regionName: "Farg'ona viloyati" },
    { nameUz: 'Rishton tumani', nameRu: 'Риштанский район', regionName: "Farg'ona viloyati" },
  ];

  const districts: Record<string, Awaited<ReturnType<typeof prisma.district.create>>> = {};
  for (const d of districtsData) {
    districts[d.nameUz] = await prisma.district.create({
      data: {
        nameUz: d.nameUz,
        nameRu: d.nameRu,
        regionId: regions[d.regionName].id,
      },
    });
  }
  console.log(`  Created ${Object.keys(districts).length} districts`);

  // ── Mahallas (for the first district of each seeded region) ────────
  const mahallasData: { nameUz: string; nameRu: string; districtName: string }[] = [
    // Yunusobod tumani (Toshkent shahri)
    { nameUz: 'Chinobod MFY', nameRu: 'Чинабад МСГ', districtName: 'Yunusobod tumani' },
    { nameUz: 'Gulbog MFY', nameRu: 'Гулбаг МСГ', districtName: 'Yunusobod tumani' },
    { nameUz: 'Tinchlik MFY', nameRu: 'Тинчлик МСГ', districtName: 'Yunusobod tumani' },
    // Samarqand shahri (Samarqand viloyati)
    { nameUz: 'Registon MFY', nameRu: 'Регистан МСГ', districtName: 'Samarqand shahri' },
    { nameUz: 'Siab MFY', nameRu: 'Сиаб МСГ', districtName: 'Samarqand shahri' },
    { nameUz: 'Afrosiyob MFY', nameRu: 'Афросиаб МСГ', districtName: 'Samarqand shahri' },
    // Farg'ona shahri (Farg'ona viloyati)
    { nameUz: 'Markaziy MFY', nameRu: 'Центральный МСГ', districtName: "Farg'ona shahri" },
    { nameUz: "Do'stlik MFY", nameRu: 'Дустлик МСГ', districtName: "Farg'ona shahri" },
    { nameUz: 'Mustaqillik MFY', nameRu: 'Мустакиллик МСГ', districtName: "Farg'ona shahri" },
  ];

  const mahallas: Record<string, Awaited<ReturnType<typeof prisma.mahalla.create>>> = {};
  for (const m of mahallasData) {
    mahallas[m.nameUz] = await prisma.mahalla.create({
      data: {
        nameUz: m.nameUz,
        nameRu: m.nameRu,
        districtId: districts[m.districtName].id,
      },
    });
  }
  console.log(`  Created ${Object.keys(mahallas).length} mahallas`);

  // ── Hash passwords ─────────────────────────────────────────────────
  const [adminHash, regionHash, districtHash, mahallaHash, youthHash] =
    await Promise.all([
      argon2.hash('Admin12345'),
      argon2.hash('Region12345'),
      argon2.hash('District12345'),
      argon2.hash('Mahalla12345'),
      argon2.hash('Youth12345'),
    ]);

  // ── Users ──────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@yoshlar360.uz',
      passwordHash: adminHash,
      fullName: 'Super Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  const regionAdmin = await prisma.user.create({
    data: {
      email: 'region@yoshlar360.uz',
      passwordHash: regionHash,
      fullName: 'Viloyat Admin',
      role: Role.REGION_ADMIN,
      regionId: regions['Toshkent shahri'].id,
    },
  });

  const districtAdmin = await prisma.user.create({
    data: {
      email: 'district@yoshlar360.uz',
      passwordHash: districtHash,
      fullName: 'Tuman Admin',
      role: Role.DISTRICT_ADMIN,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
    },
  });

  const mahallaLeader = await prisma.user.create({
    data: {
      email: 'mahalla@yoshlar360.uz',
      passwordHash: mahallaHash,
      fullName: 'Mahalla Yetakchisi',
      role: Role.MAHALLA_LEADER,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
    },
  });

  const youthUser = await prisma.user.create({
    data: {
      email: 'youth@yoshlar360.uz',
      passwordHash: youthHash,
      fullName: 'Test Yoshlar',
      role: Role.YOUTH,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
    },
  });

  console.log('  Created 5 demo users');

  // ── Youth Profile ──────────────────────────────────────────────────
  await prisma.youthProfile.create({
    data: {
      userId: youthUser.id,
      birthDate: new Date('2000-05-15'),
      gender: Gender.MALE,
      passportOrPinfl: 'AB1234567',
      education: EducationLevel.HIGHER,
      employmentStatus: EmploymentStatus.STUDENT,
      socialStatus: SocialStatus.NORMAL,
      address: "Toshkent shahri, Yunusobod tumani, Chinobod ko'chasi 12",
      interests: "Dasturlash, Sport, Kitob o'qish",
      riskLevel: RiskLevel.LOW,
    },
  });

  console.log('  Created youth profile');

  // ── Demo Appeals ───────────────────────────────────────────────────
  const appeal1 = await prisma.appeal.create({
    data: {
      title: "Mahallada sport maydoni yo'qligi",
      description:
        "Bizning mahallada yoshlar uchun sport maydoni mavjud emas. Yoshlar ko'chada sport bilan shug'ullanishga majbur.",
      category: 'Infratuzilma',
      status: AppealStatus.NEW,
      priority: Priority.HIGH,
      youthId: youthUser.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
    },
  });

  const appeal2 = await prisma.appeal.create({
    data: {
      title: "Yoshlar markaziga borish uchun transport muammosi",
      description:
        "Mahalladan yoshlar markazigacha transport yo'nalishi mavjud emas, yoshlar piyoda yurishga majbur.",
      category: 'Transport',
      status: AppealStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      youthId: youthUser.id,
      assignedToId: districtAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
    },
  });

  await prisma.appeal.create({
    data: {
      title: "Kutubxona ish vaqtini uzaytirish so'rovi",
      description:
        "Mahalla kutubxonasi soat 17:00 da yopiladi. Yoshlar uchun kechqurun ham ishlasa yaxshi bo'lardi.",
      category: "Ta'lim",
      status: AppealStatus.RESOLVED,
      priority: Priority.LOW,
      youthId: youthUser.id,
      assignedToId: mahallaLeader.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
    },
  });

  console.log('  Created 3 demo appeals');

  // ── Appeal Comments ────────────────────────────────────────────────
  await prisma.appealComment.create({
    data: {
      appealId: appeal1.id,
      userId: mahallaLeader.id,
      text: "Murojaat qabul qilindi. Tegishli idoralarga yo'naltiriladi.",
    },
  });

  await prisma.appealComment.create({
    data: {
      appealId: appeal2.id,
      userId: districtAdmin.id,
      text: "Transport bo'limi bilan muloqot olib borilmoqda.",
    },
  });

  console.log('  Created 2 appeal comments');

  // ── Demo Problems ──────────────────────────────────────────────────
  await prisma.problem.create({
    data: {
      title: "Yoshlar bandligi past darajada",
      description:
        "Tumandagi yoshlarning 30% dan ortig'i ishsiz. Kasbga yo'naltirish dasturlari kerak.",
      category: 'Bandlik',
      status: ProblemStatus.OPEN,
      priority: Priority.HIGH,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      createdById: districtAdmin.id,
      assignedToId: regionAdmin.id,
      deadline: new Date('2026-09-01'),
    },
  });

  await prisma.problem.create({
    data: {
      title: "Yoshlar orasida raqamli savodxonlik past",
      description:
        "Ko'pchilik yoshlar kompyuter va internet imkoniyatlaridan foydalana olmaydi.",
      category: "Ta'lim",
      status: ProblemStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
      createdById: mahallaLeader.id,
      assignedToId: districtAdmin.id,
      deadline: new Date('2026-08-15'),
    },
  });

  console.log('  Created 2 demo problems');

  // ── Demo Tasks ─────────────────────────────────────────────────────
  await prisma.task.create({
    data: {
      title: "Yoshlar ro'yxatini yangilash",
      description:
        "Mahallada yashovchi 14-30 yosh oralig'idagi yoshlarning to'liq ro'yxatini tuzish.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      assignedToId: mahallaLeader.id,
      createdById: districtAdmin.id,
      deadline: new Date('2026-07-15'),
    },
  });

  await prisma.task.create({
    data: {
      title: "Oylik hisobotni tayyorlash",
      description: "Iyun oyi uchun yoshlar bilan ishlash hisobotini tayyorlash.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      assignedToId: districtAdmin.id,
      createdById: regionAdmin.id,
      deadline: new Date('2026-07-05'),
    },
  });

  await prisma.task.create({
    data: {
      title: "Yoshlar forumini tashkil etish",
      description:
        "Tuman yoshlari uchun kasbga yo'naltirish forumini tashkil etish.",
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      assignedToId: districtAdmin.id,
      createdById: regionAdmin.id,
      deadline: new Date('2026-06-20'),
    },
  });

  console.log('  Created 3 demo tasks');

  // ── KPI Records ────────────────────────────────────────────────────
  const kpiMetrics = [
    {
      userId: mahallaLeader.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
      metric: 'appeals_resolved',
      value: 15,
      period: '2026-05',
    },
    {
      userId: mahallaLeader.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
      metric: 'youth_registered',
      value: 120,
      period: '2026-05',
    },
    {
      userId: districtAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      metric: 'appeals_resolved',
      value: 45,
      period: '2026-05',
    },
    {
      userId: districtAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      metric: 'tasks_completed',
      value: 12,
      period: '2026-05',
    },
    {
      userId: regionAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      metric: 'problems_resolved',
      value: 8,
      period: '2026-05',
    },
    {
      userId: regionAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      metric: 'youth_employed',
      value: 34,
      period: '2026-05',
    },
    {
      userId: mahallaLeader.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      mahallaId: mahallas['Chinobod MFY'].id,
      metric: 'appeals_resolved',
      value: 22,
      period: '2026-06',
    },
    {
      userId: districtAdmin.id,
      regionId: regions['Toshkent shahri'].id,
      districtId: districts['Yunusobod tumani'].id,
      metric: 'tasks_completed',
      value: 18,
      period: '2026-06',
    },
  ];

  for (const kpi of kpiMetrics) {
    await prisma.kpiRecord.create({ data: kpi });
  }

  console.log(`  Created ${kpiMetrics.length} KPI records`);

  // ── Notifications ──────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: mahallaLeader.id,
      title: 'Yangi murojaat',
      message: "Sizning mahallangizga yangi murojaat kelib tushdi.",
      type: 'APPEAL',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: districtAdmin.id,
      title: 'Vazifa muddati yaqinlashmoqda',
      message: "\"Oylik hisobotni tayyorlash\" vazifasining muddati 5 kunga yaqinlashdi.",
      type: 'TASK',
      isRead: false,
    },
  });

  console.log('  Created 2 notifications');

  // ── Audit Logs ─────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SEED',
      entity: 'System',
      entityId: null,
      oldValue: undefined,
      newValue: undefined,
      ipAddress: '127.0.0.1',
      userAgent: 'prisma-seed',
    },
  });

  console.log('  Created audit log entry');

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Super Admin:    admin@yoshlar360.uz    / Admin12345');
  console.log('  Region Admin:   region@yoshlar360.uz   / Region12345');
  console.log('  District Admin: district@yoshlar360.uz / District12345');
  console.log('  Mahalla Leader: mahalla@yoshlar360.uz  / Mahalla12345');
  console.log('  Youth:          youth@yoshlar360.uz    / Youth12345');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
