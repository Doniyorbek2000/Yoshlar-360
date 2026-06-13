# 🚀 Yoshlar-360: Enterprise Youth Affairs Platform

**Uzbekistan's unified digital platform for youth employment, education, and services management.**

## 📋 Project Overview

Yoshlar-360 is a government-grade, enterprise-ready platform designed to manage the entire youth ecosystem in Uzbekistan:

- **Geographic Hierarchy**: Republic → Region (Viloyat) → District (Tuman) → Neighborhood (Mahalla)
- **Youth Registry**: Comprehensive database with AI profiling
- **Employment Management**: Job matching, vacancy management
- **Education & Training**: Courses, certifications, skill development
- **Grant Management**: Entrepreneurship grants, applications
- **Problem Resolution**: Issue tracking and resolution
- **Analytics & Forecasting**: AI-powered predictions and KPIs
- **Omnichannel Support**: Web, Mobile, Telegram Bot, Call Center

## 🏗️ Architecture

### Technology Stack

**Backend**
- Framework: NestJS 12+
- Language: TypeScript
- Database: PostgreSQL 16
- ORM: Prisma
- Cache: Redis
- Queue: BullMQ
- Search: Elasticsearch
- Storage: MinIO/S3
- Real-time: Socket.IO

**Frontend**
- Admin Panel: Next.js 15 + TypeScript
- UI Framework: TailwindCSS + Shadcn UI
- Mobile: Flutter 3.32+

**DevOps**
- Containerization: Docker & Docker Compose
- CI/CD: GitHub Actions
- Reverse Proxy: Nginx
- Monitoring: Prometheus & Grafana
- Logging: Loki
- Error Tracking: Sentry

## 📁 Project Structure

```
yoshlar-360/
├── apps/
│   ├── backend/                    # NestJS Application
│   │   ├── src/
│   │   │   ├── core/              # Core modules & guards
│   │   │   ├── modules/           # Feature modules
│   │   │   ├── common/            # Shared utilities
│   │   │   ├── database/          # Prisma & migrations
│   │   │   ├── config/            # Environment configs
│   │   │   └── main.ts
│   │   ├── test/                  # E2E & Integration tests
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-panel/               # Next.js Admin Dashboard
│   │   ├── src/
│   │   │   ├── app/              # App directory (Next 15)
│   │   │   ├── components/       # Reusable components
│   │   │   ├── features/         # Feature modules
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── lib/              # Utilities & helpers
│   │   │   └── types/            # TypeScript types
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── mobile/                    # Flutter Mobile App
│       ├── lib/
│       │   ├── features/         # Feature modules
│       │   ├── core/             # Core services
│       │   ├── common/           # Shared widgets
│       │   ├── main.dart
│       │   └── config/
│       ├── android/
│       ├── ios/
│       ├── Dockerfile
│       └── pubspec.yaml
│
├── packages/                       # Shared Libraries
│   ├── sdk/                       # TypeScript SDK for API
│   └── ui-kit/                    # Shared UI components
│
├── infrastructure/                 # DevOps & Infrastructure
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.admin
│   │   └── Dockerfile.nginx
│   ├── kubernetes/               # K8s manifests
│   ├── terraform/                # Infrastructure as Code
│   └── monitoring/               # Prometheus, Grafana configs
│
├── docs/                          # Documentation
│   ├── API.md                    # API Documentation
│   ├── ARCHITECTURE.md           # System Architecture
│   ├── DEPLOYMENT.md             # Deployment Guide
│   ├── DATABASE.md               # Database Schema
│   └── roles-and-permissions.md  # RBAC/ABAC Guide
│
├── scripts/                        # Utility scripts
│   ├── setup.sh
│   ├── migrate.sh
│   └── seed-data.sh
│
├── .github/
│   └── workflows/                # GitHub Actions
│       ├── ci-backend.yml
│       ├── ci-admin.yml
│       ├── ci-mobile.yml
│       └── deploy.yml
│
├── docker-compose.yml            # Local development
├── .env.example
├── package.json                  # Workspace root
├── tsconfig.json
├── turbo.json                    # Monorepo build orchestration
└── README.md
```

## 🔐 Security Features

- **Authentication**: JWT + Refresh Tokens, OTP (SMS/Email), OneID, Google, Telegram Login
- **Authorization**: RBAC (Role-Based Access Control) + ABAC (Attribute-Based Access Control)
- **Security Headers**: CORS, CSP, X-Frame-Options
- **Rate Limiting**: DDoS protection via Nginx
- **Encryption**: At-rest (AES-256) + In-transit (TLS 1.3)
- **Device Tracking**: Session management, device fingerprinting
- **Audit Logging**: Complete action tracking (who, when, what, from where)
- **OWASP Top 10**: XSS, CSRF, SQL Injection protections
- **2FA**: Time-based OTP (TOTP)
- **GDPR-Style Privacy**: Data anonymization, right to be forgotten

## 👥 Roles & Permissions

1. **Super Admin** - System-wide control, all data, all regions
2. **Republic Admin** - Statistics, regional KPIs, monitoring
3. **Region Admin (Viloyat)** - Regional management and oversight
4. **District Admin (Tuman)** - District-level data and management
5. **Neighborhood Leader (Mahalla Yetakchisi)** - Local youth management
6. **Youth (Yosh)** - Personal cabinet access
7. **Employer (Ish Beruvchi)** - Job postings and management
8. **Partner (Hamkor)** - Grants, courses, projects management

## 📊 Core Modules

### 1. Youth Registry (Yoshlar Reestri)
- Personal information, JSHSHIR, address
- Education level tracking
- Employment status
- Social status (student, unemployed, entrepreneur, migrant, disabled, low-income)
- AI-powered profiling

### 2. Problem Management (Muammolar)
- Categories: Unemployment, Housing, Credit, Education, Health, Documents, Migration
- Status tracking: New, In Progress, Resolved, Cancelled
- File attachments: Photo, Video, PDF
- AI-powered priority assignment

### 3. Employment Module (Bandlik)
- Job listings with AI matching
- Applicant tracking
- Regional and salary filtering

### 4. Education & Courses
- IT, Language, Vocational training courses
- QR-based certificates
- PDF export capability

### 5. Grants & Entrepreneurship
- Grant management and applications
- Online application submission
- Entrepreneurship support

### 6. Events & Training
- Event calendar
- QR check-in system
- Live attendance statistics

### 7. Task Management
- Task creation and assignment
- Deadline tracking
- Status workflow: New → In Progress → Review → Done

### 8. KPI Dashboard
- Region, District, Neighborhood-level KPIs
- Formula constructor for custom metrics
- Real-time tracking

### 9. AI Assistant
- Multi-language support (Uzbek, Russian, English)
- Problem forecasting
- Unemployment prediction
- Migration trend analysis
- Personalized recommendations

### 10. Omnichannel Support
- Web platform
- Mobile app (iOS/Android)
- Telegram Bot
- Call Center integration

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis
- Flutter SDK (for mobile development)

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Doniyorbek2000/Yoshlar-360.git
cd yoshlar-360

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development environment with Docker
docker-compose -f docker-compose.yml up -d

# Run database migrations
npm run db:migrate

# Start all applications
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev                    # Start all apps in dev mode
npm run dev:backend          # Backend only
npm run dev:admin            # Admin panel only
npm run dev:mobile           # Flutter dev

# Testing
npm run test                 # Run all tests
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e             # End-to-end tests
npm run test:coverage        # Coverage report

# Database
npm run db:migrate           # Run migrations
npm run db:seed              # Seed sample data
npm run db:reset             # Reset database (dev only)

# Build & Deployment
npm run build                # Build all apps
npm run build:backend        # Backend build
npm run build:admin          # Admin build

# DevOps
docker-compose up -d         # Start infrastructure
docker-compose down          # Stop infrastructure
npm run docker:build         # Build all Docker images
```

## 🔌 API Documentation

Full API documentation is available in Swagger format at:

```
http://localhost:3000/api/docs
```

## 📱 Platform Capabilities

### Web Admin Dashboard
- User and role management
- Youth registry management
- Employment and education tracking
- KPI monitoring and reporting
- Grant and event management
- AI analytics and forecasting

### Mobile Application (iOS/Android)
- Youth profile and personal cabinet
- Job search and applications
- Course discovery
- Problem reporting
- Offline mode support
- Push notifications

### Telegram Bot
- Profile information
- Problem reporting
- Job alerts
- Course recommendations
- Admin notifications

## 🎯 Performance & Scalability

- **Capacity**: 100,000+ youth records
- **Concurrent Users**: 10,000+
- **Multi-Region Support**: Horizontal scaling ready
- **Caching Strategy**: Redis with intelligent invalidation
- **CDN**: Global content delivery
- **Database Replication**: Read replicas for reporting

## 📈 Analytics & Reporting

- Real-time dashboards
- Interactive charts (Daily, Weekly, Monthly, Yearly)
- Heatmaps for geographic distribution
- Automated report generation (PDF, Excel, CSV)
- GIS integration with Mapbox
- Export functionality

## 🔔 Notifications

- Push notifications (Web & Mobile)
- SMS alerts
- Telegram notifications
- Email communications
- Scheduled notifications

## 📁 File Storage

Supported formats:
- Documents: PDF, DOCX, XLSX
- Images: JPG, PNG
- Video: MP4

Storage backend: MinIO / AWS S3

## 🧪 Testing

- **Unit Tests**: Jest for backend and frontend
- **Integration Tests**: Database and API integration
- **E2E Tests**: Cypress for web, Flutter testing for mobile
- **Test Coverage**: Minimum 80% target

## 📊 Monitoring & Observability

- **Metrics**: Prometheus
- **Visualization**: Grafana dashboards
- **Logs**: Loki for centralized logging
- **Error Tracking**: Sentry integration
- **Alerting**: Real-time notifications for critical issues

## 🛡️ Compliance & Standards

- ✅ OWASP Top 10 protection
- ✅ GDPR-style privacy controls
- ✅ Government data security standards
- ✅ Uzbek language localization
- ✅ Multi-language support (UZ, RU, EN)

## 📄 License

Proprietary - Government of Uzbekistan

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For issues and questions, please create a GitHub issue or contact the development team.

---

**Status**: Under Active Development
**Last Updated**: June 2026
**Team**: Youth Affairs Digital Transformation Initiative
