# Agent Context

This document captures the full build history and current state of the Ground Karate Journal project, so any agent picking up work has the context it needs.

## What This App Is

A BJJ (Brazilian Jiu-Jitsu) training journal. Users log training sessions with structured reflection fields, track belt promotions, and view their progress over time. Dark-themed UI with belt-colored accents.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Runtime        | Bun (not Node.js — see CLAUDE.md)   |
| Framework      | Next.js 16 (App Router)             |
| Auth           | Clerk (`@clerk/nextjs`)             |
| Database       | Supabase (hosted Postgres)          |
| ORM            | Prisma 7.x (`@prisma/client` 7.4)  |
| Rich text      | TipTap (StarterKit, Highlight, Placeholder) |
| Styling        | Tailwind CSS 4 (dark theme only)    |
| Language       | TypeScript (strict mode)            |

## Project Structure

```
├── prisma/
│   ├── schema.prisma              # DB schema: Profile, JournalEntry, Promotion
│   └── migrations/                # Applied migration SQL files
├── prisma.config.ts               # Prisma CLI config (uses DIRECT_URL for migrations)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: ClerkProvider, fonts, dark theme
│   │   ├── globals.css            # Global styles + TipTap editor CSS
│   │   ├── sign-in/               # Public sign-in page (Clerk <SignIn>)
│   │   └── (app)/                 # Authenticated route group
│   │       ├── layout.tsx         # Sidebar + main content wrapper
│   │       ├── page.tsx           # Dashboard
│   │       ├── journal/           # Journal list, new entry, view entry ([id])
│   │       ├── profile/           # User profile page
│   │       └── promotions/        # Promotion list + new promotion
│   ├── components/
│   │   ├── Sidebar.tsx            # Fixed left nav with belt display
│   │   ├── Breadcrumb.tsx         # Hierarchical breadcrumb nav
│   │   ├── BeltBadge.tsx          # Belt color badge component
│   │   ├── JournalCard.tsx        # Journal entry list card
│   │   ├── PromotionCard.tsx      # Promotion timeline card
│   │   ├── GenerateTitleButton.tsx # Auto-generate entry titles
│   │   ├── TipTapEditor.tsx       # Rich text editor (write mode)
│   │   └── TipTapViewer.tsx       # Rich text viewer (read-only mode)
│   ├── lib/
│   │   ├── prisma.ts              # Singleton PrismaClient (server-side)
│   │   ├── storage.ts             # Data access layer (currently localStorage)
│   │   ├── types.ts               # TypeScript types: UserProfile, JournalEntry, PromotionEntry, BeltColor
│   │   ├── belts.ts               # Belt definitions, colors, display helpers
│   │   └── title-generator.ts     # Journal title generation logic
│   ├── generated/
│   │   └── prisma/                # Generated Prisma client (gitignored)
│   └── proxy.ts                   # Clerk middleware (protects all routes except /sign-in)
├── package.json
├── tsconfig.json
├── CLAUDE.md                      # LLM instructions (use Bun, not Node)
├── architecture.md                # Architectural decisions and data model
└── agent-context.md               # This file
```

## Environment Variables (`.env`)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
DATABASE_URL="postgresql://...@...supabase.com:6543/postgres?pgbouncer=true"   # Pooled (runtime)
DIRECT_URL="postgresql://...@...supabase.com:5432/postgres"                    # Direct (migrations)
```

## Database Schema (Prisma)

Three models in `prisma/schema.prisma`:

- **Profile** — `profiles` table. `id` is the Clerk user ID (not auto-generated). Has name, academy, belt/stripes.
- **JournalEntry** — `journal_entries` table. Four structured text fields (description, highlight_moves, what_went_right, what_to_improve). FK to Profile with cascade delete. Index on user_id.
- **Promotion** — `promotions` table. Belt, stripes, date, optional notes. FK to Profile with cascade delete. Index on user_id.

TypeScript fields are camelCase; Postgres columns are snake_case (via `@map`/`@@map`).

## Prisma 7.x Specifics

Prisma 7 has breaking changes from v5/v6 that any agent working with the ORM needs to know:

1. **Driver adapter required**: `PrismaClient` constructor requires an `adapter` option. We use `PrismaPg` from `@prisma/adapter-pg`.
2. **Import path**: Import from `@/generated/prisma/client`, not `@prisma/client`.
3. **Config file**: `prisma.config.ts` handles the datasource URL for CLI commands. The schema's `datasource` block has no `url` field.
4. **CLI commands**: Use `bunx --bun prisma ...` so Bun loads `.env`. Convenience scripts in package.json:
   - `bun run db:migrate` — run migrations
   - `bun run db:push` — push schema without migration files
   - `bun run db:generate` — regenerate client
   - `bun run db:studio` — open Prisma Studio

## Authentication (Clerk)

- `ClerkProvider` wraps the app in `src/app/layout.tsx` with dark theme
- `src/proxy.ts` uses `clerkMiddleware` to protect all routes except `/sign-in`
- Clerk user ID should be used as `Profile.id` in the database
- Client-side: `useUser()` from `@clerk/nextjs` provides the authenticated user
- Server-side: `auth()` from `@clerk/nextjs/server` provides the user ID

## Current Storage Layer (`src/lib/storage.ts`)

All functions are `async` and currently backed by localStorage:

- `getProfile()` / `createProfile(data)` / `updateProfile(data)` — user profile CRUD
- `getJournalEntries()` / `getJournalEntry(id)` / `createJournalEntry(data)` / `deleteJournalEntry(id)` — journal CRUD
- `getPromotions()` / `createPromotion(data)` — promotion management (auto-updates current belt/stripes on profile)

Every page is `"use client"` and calls these functions directly. The async signatures were designed so the function bodies can be swapped to Prisma queries without changing call sites.

## Build History (What Has Been Done)

### Phase 1: Initial App Build
- Next.js 16 App Router project scaffolded with Bun
- Dark-themed BJJ journal UI with Tailwind CSS 4
- TipTap rich text editors for structured journal entries
- localStorage-based data persistence with async service layer
- Belt system with definitions, badges, and display helpers
- Dashboard, journal (list/new/view), promotions (list/new), profile pages
- Sidebar navigation with breadcrumbs

### Phase 2: Authentication
- Clerk integration with `@clerk/nextjs`
- Custom dark-themed sign-in page
- Route protection via `src/proxy.ts` middleware
- Route group split: `(app)/` for authenticated pages, `sign-in/` for public

### Phase 3: Database Setup (Current)
- Supabase Postgres as the database backend
- Prisma 7.x installed and configured with driver adapter pattern
- Schema created with Profile, JournalEntry, Promotion models
- Initial migration applied to Supabase (`20260223200639_init`)
- Prisma client generated and type-checked
- Singleton client in `src/lib/prisma.ts`

## What Comes Next

These are the planned next steps, in order:

1. **Swap storage layer to Prisma** — Replace localStorage function bodies in `src/lib/storage.ts` with Prisma queries. Use the Clerk user ID as the profile ID. Pages may need to shift from client components to server components for data fetching, or use API routes.
2. **Remove localStorage dependency** — Once Prisma is the data source, remove all localStorage references.
3. **Server Components where possible** — Data-fetching pages (journal list, dashboard, promotions list) can become Server Components. Pages with TipTap editors stay client-side.
4. **Entry editing** — Add edit functionality to journal entries (currently create/view/delete only).
5. **Search and filtering** — Pagination and search for journal entries as data grows.

## Conventions

- **Bun over Node.js** — See CLAUDE.md. Use `bun`, `bunx`, `bun run`, `bun test`, `bun install`.
- **No dotenv** — Bun loads `.env` automatically. Don't import dotenv.
- **Dark theme only** — `bg-zinc-950` base, `bg-zinc-900` cards, `border-zinc-800` borders.
- **Belt-colored accents** — UI elements use the user's current belt hex color for visual identity.
- **Structured journal fields** — Four separate TipTap editors per entry, not one freeform editor.
