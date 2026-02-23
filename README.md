# Ground Karate - BJJ Training Journal

A web app for tracking Brazilian Jiu-Jitsu training sessions, recording belt promotions, and reviewing your progress over time.

## Features

- **Journal entries** with rich text editing (TipTap) across four sections: Description, Techniques Covered, What Went Right, and What to Improve
- **Belt promotion tracking** with the full IBJJF belt system (White through Red, including Coral belts and Black belt degrees)
- **Dashboard** showing current rank, recent sessions, and academy info
- **Random title generator** combining BJJ adjectives and techniques (e.g. "Sneaky Berimbolo", "Lightning Knee-Slice")
- **Profile management** with name, academy, and current belt/stripe selection
- **Dark theme** throughout with belt-colored accents
- **Breadcrumb navigation** on every page

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Rich Text**: [TipTap](https://tiptap.dev) (StarterKit + Placeholder + Highlight)
- **Data**: localStorage (async service layer designed for backend swap)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3+

### Install

```bash
bun install
```

### Development

```bash
bun run dev
```

Opens at [http://localhost:3000](http://localhost:3000). On first visit you'll be redirected to set up your profile.

### Build

```bash
bun run build
```

### Production

```bash
bun run start
```

### Lint

```bash
bun run lint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Dashboard
│   ├── globals.css                # Tailwind + TipTap styles
│   ├── journal/
│   │   ├── page.tsx               # Journal entry list
│   │   ├── new/page.tsx           # New journal entry form
│   │   └── [id]/page.tsx          # Single entry detail view
│   ├── promotions/
│   │   ├── page.tsx               # Promotion history timeline
│   │   └── new/page.tsx           # Record a new promotion
│   └── profile/
│       └── page.tsx               # Profile setup and editing
├── components/
│   ├── BeltBadge.tsx              # Visual belt rank display
│   ├── Breadcrumb.tsx             # Breadcrumb navigation
│   ├── GenerateTitleButton.tsx    # Random BJJ title generator button
│   ├── JournalCard.tsx            # Journal list item card
│   ├── PromotionCard.tsx          # Promotion timeline item
│   ├── Sidebar.tsx                # Fixed sidebar navigation
│   ├── TipTapEditor.tsx           # Rich text editor (editable)
│   └── TipTapViewer.tsx           # Rich text renderer (read-only)
└── lib/
    ├── belts.ts                   # Belt system constants and helpers
    ├── storage.ts                 # localStorage service layer
    ├── title-generator.ts         # BJJ-themed random title generator
    └── types.ts                   # TypeScript interfaces
```

## Data Persistence

All data is stored in the browser's localStorage under three keys:

| Key                   | Contents                |
|-----------------------|-------------------------|
| `bjj_profile`         | User profile object     |
| `bjj_journal_entries` | Array of journal entries |
| `bjj_promotions`      | Array of promotions     |

The service layer (`src/lib/storage.ts`) exposes async functions that return Promises, so swapping localStorage for API calls requires no changes to consuming code.

## Belt System

Supports the full IBJJF progression:

| Belt             | Max Stripes/Degrees |
|------------------|---------------------|
| White            | 4 stripes           |
| Blue             | 4 stripes           |
| Purple           | 4 stripes           |
| Brown            | 4 stripes           |
| Black            | 6 degrees           |
| Red & Black Coral| 0                   |
| Red & White Coral| 0                   |
| Red              | 0                   |
