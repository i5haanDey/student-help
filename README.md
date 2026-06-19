# Student Help

An ed-tech platform that connects students with AI doubt-solving and live teacher sessions. Built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma, NextAuth v5, and LiveKit.

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, React 19, TypeScript)
- **UI**: Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Database**: Neon (PostgreSQL via Prisma 7)
- **Auth**: NextAuth v5 (JWT, Google OAuth + credentials)
- **AI**: OpenAI GPT-4o (mock-first — works without API key)
- **Video**: LiveKit Cloud
- **Payments**: Mock (Razorpay/Stripe future)
- **Hosting**: Vercel

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

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. See `.env.example` for all required vars.

## Features

- **AI Doubt Solver** — Text + image input with confidence-labeled AI responses and 5 Explain Modes
- **Teacher On Demand** — Browse verified teachers, check availability, book instant/scheduled sessions
- **Live Classroom** — Video sessions via LiveKit with tldraw whiteboard and in-session chat
- **AI Practice Generator** — 3-tier practice sets (Easy/Medium/Advanced) generated post-session
- **Mastery Tracking** — Per-subject mastery scores with radial chart visualization
- **Role Dashboards** — Dedicated views for Students, Teachers, and Admins
- **Admin Panel** — Teacher verification queue, user/session/dispute management

## Project Structure

```
src/
├── app/            # Next.js App Router (routes, API, layouts)
│   ├── (auth)/     # Login, register, onboarding
│   ├── (dashboard)/# Student, teacher, admin dashboards
│   └── api/        # REST route handlers
├── components/     # React components by domain
│   ├── ui/         # shadcn/ui primitives
│   ├── auth/       # Login, register, onboarding forms
│   ├── doubt/      # AI doubt solver
│   ├── session/    # Live classroom (lobby, active, post)
│   ├── teacher/    # Teacher search, profile, availability
│   ├── booking/    # Booking flow, sessions list
│   ├── practice/   # Practice session UI
│   ├── mastery/    # Mastery dashboard
│   └── dummy/      # Placeholder pages (forum, marketplace, etc.)
├── lib/            # Utilities (auth, db, ai-service)
├── server/         # Server actions
├── types/          # TypeScript types
└── generated/      # Prisma client (gitignored)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Push schema to database |
