# Student Help

An ed-tech platform connecting students with AI doubt-solving and live teacher sessions. Built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma, NextAuth v5, and LiveKit.

**Live:** [student-help.vercel.app](https://student-help.vercel.app)

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, React 19, TypeScript)
- **UI**: Tailwind CSS v4 + shadcn/ui + Framer Motion + Lucide icons
- **Database**: Neon (PostgreSQL via Prisma 7, serverless adapter)
- **Auth**: NextAuth v5 beta (JWT, Google OAuth + credentials)
- **AI**: OpenAI GPT-4o (mock-first — works without API key)
- **Video**: LiveKit Cloud
- **Payments**: Mock (Razorpay/Stripe future)
- **Hosting**: Vercel
- **Charts**: Recharts

## Features

- **AI Doubt Solver** — Text + image input with confidence-labeled AI responses and 5 Explain Modes (Simple, Visual, Analogy, Step-by-Step, Exam-Oriented)
- **Teacher On Demand** — Browse verified teachers, check availability, book instant or scheduled sessions
- **Live Classroom** — Video sessions via LiveKit with tldraw whiteboard and in-session chat
- **AI Practice Generator** — 3-tier practice sets (Easy/Medium/Advanced) generated post-session
- **Mastery Tracking** — Per-subject mastery scores with radial chart visualization
- **Role Dashboards** — Dedicated views for Students, Teachers, and Admins
- **Admin Panel** — Teacher verification queue, user/session/dispute management
- **PWA** — Installable on mobile home screen (add from browser menu)

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Mobile access: `next.config.ts` has `allowedDevOrigins: ["192.168.1.5"]` — replace with your IP.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth encryption key (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `LIVEKIT_API_KEY` | No | LiveKit Cloud API key |
| `LIVEKIT_API_SECRET` | No | LiveKit Cloud API secret |
| `LIVEKIT_URL` | No | LiveKit Cloud WS URL |
| `OPENAI_API_KEY` | No | OpenAI API key (mock responses used when absent) |
| `UPLOADTHING_SECRET` | No | File uploads |
| `UPLOADTHING_APP_ID` | No | File uploads |
| `RAZORPAY_KEY_ID` | No | Payments (mock mode by default) |
| `RAZORPAY_KEY_SECRET` | No | Payments |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | No | Payments |
| `RESEND_API_KEY` | No | Email |

Only `DATABASE_URL` and `AUTH_SECRET` are required.

## Deployment

Deploy on Vercel (free tier):

1. Push repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `DATABASE_URL` and `AUTH_SECRET` as environment variables
4. Deploy — Vercel auto-runs `npx prisma generate && next build`

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Login, register, onboarding
│   ├── (dashboard)/  # Student / Teacher / Admin dashboards
│   └── api/          # 14 REST route handler groups
├── components/       # React components by domain
│   ├── ui/           # shadcn/ui primitives
│   ├── auth/         # Login, register, onboarding forms
│   ├── dashboard/    # Role-specific dashboards
│   ├── doubt/        # AI doubt solver
│   ├── session/      # Live classroom (lobby, active, post)
│   ├── teacher/      # Search, profile, availability
│   ├── booking/      # Booking flow, sessions list
│   ├── practice/     # Practice session UI
│   ├── mastery/      # Mastery dashboard
│   └── dummy/        # Placeholder pages
├── lib/              # Core utilities (auth, db, ai-service)
├── server/           # Server actions (admin, auth)
└── types/            # TypeScript type definitions
```

## API Routes

All routes check `auth()` and return 401/403 for unauthorized requests.

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/onboarding/student` | POST | Student profile setup |
| `/api/onboarding/teacher` | POST | Teacher profile setup |
| `/api/doubt/solve` | POST | AI doubt solver (text + image) |
| `/api/doubt/explain` | POST | 5 explain modes |
| `/api/teachers` | GET | Teacher search/filter |
| `/api/teachers/[id]` | GET | Teacher profile |
| `/api/teachers/availability` | GET/POST/DELETE | Slot management |
| `/api/teachers/verify` | POST | Submit verification docs |
| `/api/bookings` | GET/POST | Booking CRUD |
| `/api/bookings/[id]` | GET/PATCH | Booking detail |
| `/api/payments` | POST | Mock payment |
| `/api/livekit/token` | POST | LiveKit JWT token |
| `/api/sessions/[id]` | PATCH | Live session |
| `/api/sessions/[id]/chat` | GET/POST | Chat messages |
| `/api/sessions/[id]/chat` | GET/POST | Chat messages |
| `/api/sessions/[id]/whiteboard` | GET/PUT | tldraw snapshots |
| `/api/sessions/[id]/end` | POST | End session |
| `/api/sessions/[id]/summary` | POST | AI session summary |
| `/api/practice` | POST | Generate practice sets |
| `/api/practice/[id]/attempt` | POST | Submit answer |
| `/api/mastery` | GET/POST | Mastery scores |
| `/api/ratings` | POST | Post-session ratings |
| `/api/notifications` | GET/PATCH | In-app notifications |
| `/api/profile` | PUT | Update profile |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Push schema to database |

## Documentation

Additional project docs are in the parent directory:

- `MASTER_PLAN.md` — Build plan with route map and status
- `STUDENT_HELP_PRD_AI_v1.0.md` — Product Requirements Document
- `STUDENT_HELP_TECHDOC_AI_v1.0.md` — Technical Architecture Document
- `STUDENT_HELP_USERFLOW_AI_v1.0.md` — User Flow Document
