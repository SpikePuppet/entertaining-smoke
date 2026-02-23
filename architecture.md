# Architecture

## Overview

Ground Karate is a client-side application built with Next.js App Router, authenticated via Clerk. All pages are client components (`"use client"`) since the app relies on browser APIs (localStorage, TipTap editors). The Next.js framework provides routing, bundling, and static optimization. Clerk handles user authentication with a custom-themed sign-in page.

## Key Decisions

### Next.js App Router (not Bun.serve)

The CLAUDE.md instructions suggest using `Bun.serve()` with HTML imports. We chose Next.js instead because:

- The app has multiple routes with dynamic segments (`/journal/[id]`), which benefit from file-based routing
- Next.js provides built-in code splitting per route
- The App Router's layout system gives us a shared sidebar without re-mounting on navigation
- TipTap and React 19 integration is more straightforward with a standard React framework

The trade-off is a heavier dependency footprint. Bun is still used as the runtime and package manager.

### Authentication with Clerk

Clerk provides authentication via `@clerk/nextjs`. The integration uses:

- **`ClerkProvider`** in the root layout (`src/app/layout.tsx`) wrapping the entire app with dark theme defaults
- **`src/proxy.ts`** (Next.js 16's replacement for `middleware.ts`) using `clerkMiddleware` to protect all routes except `/sign-in`
- **Custom sign-in page** at `src/app/sign-in/[[...sign-in]]/page.tsx` with Clerk's `<SignIn>` component styled to match the zinc dark theme

### Route Group Layout Split

The app uses a Next.js `(app)` route group to control which pages show the sidebar:

```
src/app/
  layout.tsx              ← root: ClerkProvider + html/body (no sidebar)
  sign-in/[[...sign-in]]/ ← public: full-screen centered sign-in
  (app)/
    layout.tsx            ← authenticated: Sidebar + main wrapper
    page.tsx              ← dashboard
    journal/              ← journal pages
    profile/              ← profile page
    promotions/           ← promotion pages
```

The `(app)` group doesn't affect URLs — all routes remain at `/`, `/journal`, etc. The sign-in page renders without the sidebar since it's outside the `(app)` group. Authenticated pages inherit the sidebar from `src/app/(app)/layout.tsx`.

### Database: Supabase + Prisma ORM

The app uses Supabase (hosted Postgres) as its database, managed through Prisma ORM (v7.x) for schema definition, migrations, and type-safe queries.

- **`prisma/schema.prisma`** defines three models: `Profile`, `JournalEntry`, `Promotion`
- **`prisma.config.ts`** configures the datasource URL for CLI commands (migrations use `DIRECT_URL` to bypass PgBouncer)
- **`src/lib/prisma.ts`** exports a singleton `PrismaClient` using the `@prisma/adapter-pg` driver adapter (required by Prisma 7.x)
- **`src/generated/prisma/`** contains the generated type-safe client (gitignored, regenerated via `bun run db:generate`)

Key Prisma 7.x details:
- The `PrismaClient` constructor requires a driver adapter (`PrismaPg` from `@prisma/adapter-pg`)
- Import path is `@/generated/prisma/client` (not `@prisma/client`)
- CLI commands must use `bunx --bun` to load `.env` automatically (convenience scripts in `package.json`)
- `Profile.id` is the Clerk user ID (not auto-generated) — identity comes from Clerk

### Client Components Throughout

Every page is currently marked `"use client"`. This was originally because all data lived in localStorage. TipTap editors also require browser DOM. As the storage layer migrates to server-side Prisma queries, data-fetching pages can become Server Components while editor-heavy pages remain client-side.

### Async Service Layer (localStorage, migrating to Prisma)

`src/lib/storage.ts` wraps localStorage behind `async` functions that return Promises. localStorage is synchronous, so this is technically unnecessary today. The reason:

- Every function signature matches what a `fetch`-based or Prisma-based implementation would look like
- Swapping to a real backend means changing the function bodies, not the call sites
- No consuming code needs to be refactored when the storage backend changes

The Prisma schema and client are in place. The next step is replacing the localStorage function bodies in `storage.ts` with Prisma queries.

### TipTap for Rich Text

Journal entries use TipTap with a minimal extension set:

- **StarterKit**: Bold, italic, lists, paragraphs
- **Placeholder**: Empty-state hint text per field
- **Highlight**: Mark important text

Heading formatting was intentionally removed from the toolbar. The journal sections (Description, Techniques Covered, What Went Right, What to Improve) provide structure, so in-editor headings are redundant.

The editor and viewer are separate components. The viewer uses the same extensions with `editable: false` to ensure content renders identically. Both set `immediatelyRender: false` to avoid React hydration mismatches during SSR.

### Journal Entry Structure

Each entry has four distinct TipTap fields rather than a single freeform editor:

| Field              | Purpose                                |
|--------------------|----------------------------------------|
| Description        | General session notes                  |
| Techniques Covered | Specific techniques drilled or learned |
| What Went Right    | Positive reflection                    |
| What to Improve    | Areas to focus on next session         |

This structured approach encourages consistent reflection and makes entries scannable when reviewing training history.

### Belt System as Data

Belt definitions live in `src/lib/belts.ts` as a constants array rather than being derived from enums or a database. Each belt has:

- A color identifier (used as the TypeScript union type)
- A display label
- A hex color code (used for UI accents)
- A max stripe/degree count

This makes it straightforward to render belt pickers, badges, and validation without conditional logic scattered across components.

### Navigation: Sidebar + Breadcrumbs

Two complementary navigation patterns:

- **Sidebar** (`Sidebar.tsx`): Fixed left panel with top-level links (Dashboard, Journal, Promotions, Profile) and current belt display. Highlights the active section.
- **Breadcrumbs** (`Breadcrumb.tsx`): Per-page path showing hierarchical location (e.g. `Dashboard / Journal / New Entry`). Earlier segments are clickable links; the current page is plain text.

The sidebar handles primary navigation. Breadcrumbs provide context within nested routes.

### Styling Approach

- **Dark theme only**: `bg-zinc-950` base with `bg-zinc-900` cards and `border-zinc-800` borders
- **Belt-colored accents**: Journal cards have a left border colored to match the user's current belt
- **No CSS-in-JS**: All styling is Tailwind utility classes. TipTap editor styles are in `globals.css` since they target generated DOM elements that can't receive class props.

## Data Model

### TypeScript types (`src/lib/types.ts`)

```
UserProfile
├── id: string (UUID)
├── name: string
├── academyName?: string
├── currentBelt: BeltColor
├── currentStripes: number
└── createdAt: string (ISO 8601)

JournalEntry
├── id: string (UUID)
├── userId: string
├── title: string
├── description: string (HTML)
├── highlightMoves: string (HTML)
├── whatWentRight: string (HTML)
├── whatToImprove: string (HTML)
├── createdAt: string (ISO 8601)
└── updatedAt: string (ISO 8601)

PromotionEntry
├── id: string (UUID)
├── userId: string
├── belt: BeltColor
├── stripes: number
├── date: string (ISO 8601)
├── notes?: string
└── createdAt: string (ISO 8601)
```

`BeltColor` is a union type: `"white" | "blue" | "purple" | "brown" | "black" | "coral-red-black" | "coral-red-white" | "red"`

### Database tables (`prisma/schema.prisma`)

```
profiles
├── id: text (PK, Clerk user ID)
├── name: text
├── academy_name: text?
├── current_belt: text (default "white")
├── current_stripes: int (default 0)
└── created_at: timestamp

journal_entries
├── id: uuid (PK)
├── user_id: text (FK → profiles.id, cascade delete)
├── title: text
├── description: text
├── highlight_moves: text
├── what_went_right: text
├── what_to_improve: text
├── created_at: timestamp
└── updated_at: timestamp (auto-updated)

promotions
├── id: uuid (PK)
├── user_id: text (FK → profiles.id, cascade delete)
├── belt: text
├── stripes: int (default 0)
├── date: date
├── notes: text?
└── created_at: timestamp
```

Indexes on `user_id` in both `journal_entries` and `promotions` for efficient per-user queries.

## Future Considerations

- **Storage migration**: Replace localStorage function bodies in `storage.ts` with Prisma queries. The async signatures already match. This is the immediate next step.
- **Clerk user ID migration**: Replace the localStorage UUID `userId` with the authenticated Clerk user ID from `useUser()` or `auth()`. The `Profile.id` in the database is already designed to hold the Clerk user ID.
- **Server Components**: Once storage moves to Prisma, data-fetching pages can become Server Components. Editor pages will remain client-side.
- **Search/filtering**: Journal list currently loads all entries. Add pagination or search when entry count warrants it.
- **Entry editing**: Currently entries are create/view/delete only. Adding an edit page would reuse `TipTapEditor` with pre-filled content.
- **Export**: Consider a database export endpoint once localStorage is fully replaced.
