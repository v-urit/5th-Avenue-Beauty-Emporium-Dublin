# 5th Avenue Beauty Emporium — Online Booking & Digital Flagship

> **Luxury Manicure, Pedicure & BIAB Sanctuary**  
> 📍 **45 Clarendon Street, Dublin 2, Ireland**  
> ⭐ **Google Rating: 4.9 / 5.0 (1,755 Verified Reviews)**  
> 🕒 **Open Daily until 20:00 • 24/7 Online Booking**

---

## 🏛 Project Architecture (Monorepo)

A high-performance, production-grade monorepo engineered with clean architecture, strict type-safety, and bespoke luxury motion design.

```
.
├── backend/                  # High-throughput Go REST API
│   ├── cmd/api/main.go       # Fiber v2 entrypoint & graceful shutdown
│   ├── internal/
│   │   ├── config/           # Environment configuration
│   │   ├── handler/          # HTTP request handlers (Auth, Bookings, Services, Gallery)
│   │   ├── service/          # Business logic (JWT rotation, OTP, bcrypt, Twilio SMS)
│   │   ├── repository/       # Type-safe sqlc generated PostgreSQL queries
│   │   └── middleware/       # JWT auth, security headers, CORS
│   ├── migrations/           # golang-migrate up/down SQL schemas
│   ├── sql/queries/          # Raw SQL queries for sqlc compilation
│   ├── sqlc.yaml             # sqlc v2 configuration
│   └── Dockerfile            # Multi-stage minimal Alpine image
│
├── frontend/                 # Next.js App Router (React 19)
│   ├── app/
│   │   ├── page.tsx          # Editorial Landing Page (Hero Carousel, Infinite Marquee)
│   │   ├── booking/page.tsx  # 24/7 Interactive appointment wizard
│   │   ├── dashboard/page.tsx# Client portal (Appointment history, Cancel action)
│   │   ├── login/page.tsx    # shadcn auth card (Email, Google, Phone + OTP)
│   │   └── signup/page.tsx   # Client registration
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (Button, Card, Input, Tabs, etc.)
│   │   ├── hero-carousel.tsx # Autoplay carousel with stagger motion entrance
│   │   ├── marquee-gallery.tsx# Dual continuous infinite scrolling marquee (pause-on-hover)
│   │   ├── services-section.tsx# Luxury service cards with instant booking trigger
│   │   ├── testimonials.tsx  # Social proof (4.9 rating & 1,755 Google reviews)
│   │   └── location-hours.tsx# 45 Clarendon St, Dublin, directions & opening hours
│   ├── lib/api.ts            # Axios with auto-refresh token on 401 interceptor
│   └── Dockerfile            # Multi-stage standalone Next.js image
│
├── .github/workflows/
│   ├── ci.yml                # CI: Go test & vet, Next.js build & typecheck
│   └── cd.yml                # CD: Docker Buildx with GitHub Actions layer cache & GHCR
│
├── docker-compose.yml        # Orchestration: backend, frontend, postgres, redis
└── README.md
```

---

## ✨ Visual & Motion Highlights

- **Hero Carousel**: Ken Burns cinematic photography, autoplay with manual swipe/chevrons, gradient overlays, and Framer Motion staggered entrance animations that re-trigger on every page load.
- **Infinite Marquee Gallery**: Dual-track horizontal continuous scrolling in alternating directions, 60fps hardware acceleration, rounded corners, soft shadow lift, and smooth **pause-on-hover**.
- **Dark/Light Mode**: Flawless palette switching with `next-themes` persisted across sessions.
- **Tailwind & shadcn/ui**: Bespoke luxury tokens (champagne gold `#dfb793`, warm amber `#9e7552`, obsidian dark mode `#0d0c0b`).

---

## 🔐 Security Standards

- **Short-Lived Access Tokens**: 15-minute JWTs signed with HMAC-SHA256.
- **Refresh Token Rotation**: 7-day cryptographically secure refresh tokens stored as SHA-256 hashes in PostgreSQL. Using a refresh token invalidates the old token and issues a fresh pair.
- **Phone + OTP Defense**: 6-digit cryptographic verification codes with a 5-minute TTL and maximum 5 attempts.
- **Password Security**: Bcrypt with cost factor 12.
- **SQL Injection Prevention**: 100% compile-time type-safe parameterized queries via `sqlc`.
- **Security Headers**: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

---

## 🚀 Quickstart with Docker Compose

To launch the complete stack (PostgreSQL 16, Redis 7, Go Backend, and Next.js Frontend) in one command:

```bash
# 1. Clone repository
git clone https://github.com/v-urit/5th.git
cd 5th

# 2. Configure environment (optional, defaults provided)
cp .env.example .env

# 3. Build and launch all services
docker compose up -d --build
```

### Access URLs:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **API Health Check**: [http://localhost:8080/health](http://localhost:8080/health)

---

## 💻 Local Development (Without Docker)

### 1. Start PostgreSQL & Redis
Ensure PostgreSQL and Redis are running locally or via Docker:
```bash
docker run -d --name local-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=beauty_emporium postgres:16-alpine
docker run -d --name local-redis -p 6379:6379 redis:7-alpine
```

### 2. Run Backend (Go)
```bash
cd backend

# Run database migrations
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/beauty_emporium?sslmode=disable" up

# Run backend API server
go run cmd/api/main.go
```

### 3. Run Frontend (Next.js)
```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
go test -v ./...
```

### Frontend Type Check & Build
```bash
cd frontend
pnpm build
```

---

## 📜 API Route Reference

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Service health status & metadata | No |
| `POST` | `/api/auth/register` | Register new customer profile | No |
| `POST` | `/api/auth/login` | Login with email & password | No |
| `POST` | `/api/auth/refresh` | Rotate and issue new JWT pair | No |
| `POST` | `/api/auth/logout` | Revoke refresh token | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth redirect | No |
| `GET` | `/api/auth/google/callback`| Handle Google OAuth callback | No |
| `POST` | `/api/auth/otp/send` | Dispatch 6-digit SMS verification code | No |
| `POST` | `/api/auth/otp/verify` | Verify OTP code & authenticate | No |
| `GET` | `/api/services` | Retrieve list of luxury treatments | No |
| `GET` | `/api/gallery` | Retrieve gallery image feed | No |
| `POST` | `/api/bookings` | Create confirmed appointment | **Yes (Bearer JWT)** |
| `GET` | `/api/bookings/me` | Fetch client's booking history | **Yes (Bearer JWT)** |
| `PATCH`| `/api/bookings/:id/cancel`| Cancel scheduled appointment | **Yes (Bearer JWT)** |
