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

### Client Components Throughout

Every page is marked `"use client"`. This is intentional:

- All data lives in localStorage, which is a browser-only API
- TipTap editors require browser DOM
- No server-side data fetching is needed

Next.js still provides value here through its router, layout composition, and build tooling. If a backend is added later, data-fetching pages could become Server Components while editor-heavy pages remain client-side.

### Async Service Layer Over localStorage

`src/lib/storage.ts` wraps localStorage behind `async` functions that return Promises. localStorage is synchronous, so this is technically unnecessary today. The reason:

- Every function signature matches what a `fetch`-based implementation would look like
- Swapping to a real backend means changing the function bodies, not the call sites
- No consuming code needs to be refactored when the storage backend changes

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

## Future Considerations

- **Backend swap**: Replace function bodies in `storage.ts` with `fetch` calls. No other files need to change.
- **Clerk user ID migration**: Replace the localStorage UUID `userId` with the authenticated Clerk user ID from `useUser()` or `auth()`. The `userId` field on entries is already present.
- **Search/filtering**: Journal list currently loads all entries. Add pagination or search when entry count warrants it.
- **Entry editing**: Currently entries are create/view/delete only. Adding an edit page would reuse `TipTapEditor` with pre-filled content.
- **Export**: The localStorage JSON format is simple enough to export as a backup file.
