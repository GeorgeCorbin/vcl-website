# Varsity Club Lacrosse (VCL) Website

Club lacrosse coverage — articles, weekly media polls, and league data. Built with Next.js and PostgreSQL.

**Current product focus:** articles first, rankings (media polls) second. Transfers and admin ad management are feature-flagged off by default but can be re-enabled without code changes.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Auth (admin) | Cookie session (`/admin/login`) — NextAuth is in dependencies for future use |
| Forms | Server Actions, react-hook-form, Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd vcl-website
npm install
```

`postinstall` runs `prisma generate` automatically.

2. Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vcl_website?schema=public"
```

3. Apply migrations and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin access

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Default dev login is configured in `src/app/admin/login/page.tsx` (replace with proper auth before production).

## Feature Flags

Toggle features in `src/lib/feature-flags.ts`. When a flag is `false`, related UI is hidden; database models and backend code stay in place so you can turn features back on later.

| Flag | Default | Controls |
|------|---------|----------|
| `MEDIA_POLLS` | `false` | Public `/polls` routes, nav links, home cards; admin Media Polls section |
| `TRANSFERS` | `false` | Public `/transfers`, nav, home card; admin Transfers section |
| `ADS_ADMIN` | `false` | Admin Ad Management (`/admin/ads`) |
| `ADS_PUBLIC` | `true` | Public ad slots (e.g. bottom banner in root layout) |

Disabled routes redirect to home or `/admin` if visited directly.

## Project Structure

```
vcl-website/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/          # Marketing + content (articles, polls, about, …)
│   │   ├── admin/             # CMS / operations panel
│   │   ├── api/               # REST JSON routes
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ads/               # Ad slot components (gated by ADS_PUBLIC)
│   │   ├── layout/            # Header, Footer
│   │   └── ui/                # shadcn/ui
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── feature-flags.ts
│   │   ├── league-config.ts
│   │   ├── services/          # ArticleService, PollService, etc.
│   │   └── upload.ts
│   └── proxy.ts               # Admin route protection
├── package.json
└── prisma.config.ts
```

## Features

### Public site

| Route | Description | Notes |
|-------|-------------|--------|
| `/` | Home | Hero, feature cards, latest articles |
| `/articles` | Article index | Wire to `ArticleService` (in progress) |
| `/articles/[slug]` | Article detail | |
| `/polls` | Media poll / rankings | Requires `MEDIA_POLLS` |
| `/transfers` | Transfer tracker | Requires `TRANSFERS` |
| `/about` | About VCL | Copy respects feature flags |
| `/privacy`, `/terms` | Legal pages | |

### Admin panel (`/admin`)

| Section | Description |
|---------|-------------|
| Dashboard | Stats, quick actions, recent activity |
| Articles | Create, edit, publish (rich HTML editor) |
| Media Polls | Weekly rankings (flag: `MEDIA_POLLS`) |
| Transfers | Player movements (flag: `TRANSFERS`) |
| Teams | Team database for polls/transfers |
| Leagues | League config and divisions |
| Content | Static pages (about, etc.) |
| Ads | Ad unit CRUD (flag: `ADS_ADMIN`) — public ads are intended to be managed in code |
| Settings | Site configuration |

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/articles` | GET, POST | List / create articles |
| `/api/articles/[id]` | GET, PATCH, DELETE | Single article |
| `/api/teams` | GET, POST | List / create teams |
| `/api/teams/[id]` | GET, PATCH, DELETE | Single team |
| `/api/polls` | GET, POST | Poll weeks |
| `/api/polls/[id]` | GET, PATCH, DELETE | Single poll week |
| `/api/polls/[id]/entries` | POST | Poll entries |
| `/api/transfers` | GET, POST | Transfers |
| `/api/transfers/[id]` | GET, PATCH, DELETE | Single transfer |
| `/api/leagues/[code]/conferences` | GET | League conferences |
| `/api/leagues/[code]/divisions` | GET | League divisions |

Admin mutations also use **Server Actions** under `src/app/admin/*/actions.ts`.

## Database (Prisma)

### Editorial

- **Article**, **Tag** — news and analysis
- **PollWeek**, **PollEntry** — weekly media poll rankings
- **Transfer** — player movements between teams

### Reference data

- **Team**, **LeagueConfig** — teams and league/division metadata
- **AdUnit** — ad placements (admin UI optional; rendering via code)
- **Page** — CMS static content
- **UploadedImage** — article/media uploads

### Future MCLA sync

- **Team** / **Game** include `mclaTeamId` / `mclaGameId` fields
- `TeamService.syncFromMclaApi()` is stubbed for future API integration

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply migrations (dev) |
| `npx prisma studio` | Open Prisma Studio |

## Dependency Security

After `npm install`, run:

```bash
npm audit
```

Use **`npm audit fix`** for safe patches. **Do not use `npm audit fix --force`** — it can downgrade Next.js, Prisma, and next-auth to incompatible versions.

Transitive dependency fixes are pinned in `package.json` under `overrides` (PostCSS, uuid, `@hono/node-server`). If new advisories appear, prefer updating direct dependencies or adding targeted overrides rather than forcing major downgrades.

## Deployment

Build and deploy (e.g. Vercel):

```bash
npm run build
```

Set `DATABASE_URL` in your hosting environment and run migrations against the production database before going live.

### Self-hosted (Lightsail, VPS)

Article and cover images are stored on disk, not in the database. By default they go to `public/uploads`, which is **gitignored** and is **lost on every deploy** if you pull a fresh copy of the app.

On a persistent server, set a directory outside the deploy folder:

```bash
mkdir -p ~/vcl-data/uploads
```

```env
UPLOAD_DIR=/home/ubuntu/vcl-data/uploads
```

Restart the app after changing `.env`. Re-upload any images that were saved before this was configured, or copy existing files from `public/uploads` into the new directory.

Images are served at `/uploads/...` via the app, so they work whether files live under `public/uploads` or a custom `UPLOAD_DIR`.

## License

MIT
