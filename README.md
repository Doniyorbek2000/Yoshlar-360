# Yoshlar 360

O'zbekiston yoshlar bilan ishlash platformasi - Youth Management Platform for Uzbekistan.

## Texnologiyalar

| Komponent | Texnologiya |
|-----------|-------------|
| Backend API | NestJS, Prisma ORM, PostgreSQL |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Telegram Bot | Telegraf.js |
| Auth | JWT + Refresh Token Rotation, Argon2 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| DevOps | Docker, Docker Compose, Nginx |

## Tizim darajalari

1. **SUPER_ADMIN** - Barcha tizimni boshqaradi
2. **REPUBLIC_ADMIN** - Respublika darajasida boshqaruv
3. **REGION_ADMIN** - Viloyat darajasida boshqaruv
4. **DISTRICT_ADMIN** - Tuman darajasida boshqaruv
5. **MAHALLA_LEADER** - Mahalla yetakchisi
6. **YOUTH** - Oddiy foydalanuvchi / yosh
7. **MODERATOR** - Moderator

## Loyiha tuzilmasi

```
yoshlar-360/
  apps/
    backend/          # NestJS API
      prisma/         # Schema va seed
      src/
        common/       # Guards, decorators, filters, interceptors
        database/     # Prisma service
        modules/      # Auth, Users, Youth, Appeals, Problems,
                      # Tasks, KPI, Reports, Imports, Notifications,
                      # Dashboard, AuditLog, Regions, Health
    web/              # Next.js Admin Panel
      src/
        app/          # Pages (App Router)
        components/
        lib/          # API client, utils
        store/        # Zustand store
    bot/              # Telegram Bot (Telegraf.js)
      src/
        i18n/         # Uzbek/Russian translations
        keyboards/
  docker/             # Dockerfiles, nginx.conf
  docker-compose.yml
  pnpm-workspace.yaml
```

## Tez boshlash (Development)

### 1. Talablar

- Node.js >= 20
- PostgreSQL 16
- Redis 7
- pnpm

### 2. O'rnatish

```bash
git clone <repo-url> yoshlar-360
cd yoshlar-360
pnpm install
cp .env.example apps/backend/.env
```

### 3. Database sozlash

```bash
# Docker orqali PostgreSQL va Redis
docker-compose up -d postgres redis

# Migration
cd apps/backend
npx prisma migrate dev --name init

# Prisma Client
npx prisma generate

# Seed data
npx ts-node prisma/seed.ts
```

### 4. Development server

```bash
# Backend (port 3000)
cd apps/backend && pnpm dev

# Frontend (port 3001)
cd apps/web && pnpm dev

# Bot
cd apps/bot && pnpm dev
```

### 5. Kirish

- Admin Panel: http://localhost:3001
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

### Demo accountlar

| Rol | Email | Parol |
|-----|-------|-------|
| Super Admin | admin@yoshlar360.uz | Admin12345 |
| Viloyat Admin | region@yoshlar360.uz | Region12345 |
| Tuman Admin | district@yoshlar360.uz | District12345 |
| Mahalla Yetakchisi | mahalla@yoshlar360.uz | Mahalla12345 |
| Yoshlar | youth@yoshlar360.uz | Youth12345 |

## Production (Docker)

```bash
docker-compose up -d --build
docker-compose logs -f
```

### Servicelar

| Service | Port |
|---------|------|
| API | 3000 |
| Web | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Nginx | 80/443 |

## Environment variables

```env
NODE_ENV=development
API_PORT=3000
DATABASE_URL=postgresql://yoshlar:yoshlar360@localhost:5432/yoshlar_360_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGINS=http://localhost:3001
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## API Modullar

| Modul | Endpoint | Tavsif |
|-------|----------|--------|
| Auth | /api/auth | Login, Register, Refresh, Logout, Me |
| Users | /api/users | Foydalanuvchilar CRUD |
| Youth | /api/youth | Yoshlar profili CRUD |
| Appeals | /api/appeals | Murojaatlar boshqaruvi |
| Problems | /api/problems | Muammolar boshqaruvi |
| Tasks | /api/tasks | Vazifalar boshqaruvi |
| KPI | /api/kpi | KPI ko'rsatkichlari |
| Reports | /api/reports | Hisobotlar |
| Imports | /api/imports | Excel import |
| Notifications | /api/notifications | Bildirishnomalar |
| Dashboard | /api/dashboard | Statistika |
| Audit Log | /api/audit-logs | Audit loglar |
| Regions | /api/regions | Viloyat/Tuman/Mahalla |

## Telegram Bot

1. BotFather orqali bot yarating
2. TELEGRAM_BOT_TOKEN ni .env ga qo'shing
3. Bot imkoniyatlari:
   - Til tanlash (O'zbek / Rus)
   - Telefon raqam orqali ro'yxatdan o'tish
   - Viloyat / Tuman / Mahalla tanlash
   - Murojaat yuborish
   - Murojaatlar holatini tekshirish
   - Profil ko'rish

## Xavfsizlik

- Argon2 password hashing
- JWT Access Token (15 daqiqa)
- Refresh Token Rotation (7 kun)
- RBAC/ABAC permission system
- Rate limiting (ThrottlerGuard)
- Helmet security headers
- CORS konfiguratsiya
- Input validation (class-validator)
- SQL injection himoyasi (Prisma ORM)
- Audit log

## Litsenziya

PROPRIETARY - Yoshlar-360 Team
