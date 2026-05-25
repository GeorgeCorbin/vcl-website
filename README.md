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

### Self-hosted (Lightsail, VPS) — recommended setup

Uploads live on disk; the database only stores the URL (e.g. `/uploads/1234-photo.jpg`). **Do not store uploads inside the app repo** — `git pull`, `git clean -fd`, and rebuilds can wipe `public/uploads/`.

Use a persistent folder **outside** the project, the same pattern as SMLL:

#### One-time setup

```bash
# 1. Create persistent storage (survives every deploy)
mkdir -p ~/vcl-data/uploads

# 2. Move any existing uploads out of the repo
cp ~/vcl-website/public/uploads/* ~/vcl-data/uploads/ 2>/dev/null || true

# 3. Tell the app where to write new files (.env in project root)
#    Add this line to ~/vcl-website/.env:
#    UPLOADS_DIR=/home/ubuntu/vcl-data/uploads

# 4. Restart so PM2 picks up the env var
cd ~/vcl-website
pm2 restart vcl --update-env   # use your PM2 process name
```

#### Nginx (recommended for production)

Serve `/uploads/` directly from disk. The `alias` path **must match** `UPLOADS_DIR`:

```nginx
location /uploads/ {
    alias /home/ubuntu/vcl-data/uploads/;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Nginx handles image requests without hitting Node. If you skip this block, the Next.js `/uploads/[...path]` route can serve files instead — but Nginx + persistent `UPLOADS_DIR` is the setup to use on Lightsail.

#### Deploy workflow (safe for uploads)

After the one-time setup above, normal deploys are fine:

```bash
cd ~/vcl-website
git pull
npm ci          # if lockfile changed
npm run build
npx prisma migrate deploy   # if migrations added
pm2 restart vcl --update-env
```

`~/vcl-data/uploads/` is outside the repo, so **`git clean -fd` and rebuilds never touch your images**. Only the database and `~/vcl-data/` need backups for editorial content.

#### Checklist

| Item | Value |
|------|--------|
| App writes to | `UPLOADS_DIR=/home/ubuntu/vcl-data/uploads` in `.env` |
| Nginx `alias` | `/home/ubuntu/vcl-data/uploads/` (trailing slash required) |
| PM2 restart | Always use `--update-env` after editing `.env` |
| Do not use | `public/uploads/` on production (ephemeral) |

**Admin image previews:** Next.js `Image` components use `unoptimized` for `/uploads/` paths to avoid 400 errors from the Image Optimization API behind Nginx/PM2.

## License

MIT


## Domain Name Options

| Domain                               | Price |
|--------------------------------------|-------|
| varsityclublacrosse.net              | $12   |
| varsityclublacrosse.org              | $9    |
| varsity-club-lacrosse.com            | $11   |
| vclacrosse.com                       | $11   |
| varsityclublax.com                   | $11   |
| vclnetwork.com                       | $11   |
| varsityclublacrossenetwork.com       | $11   |
| varsityclublacrosseinsider.com       | $11   |
| varsityclublacrossenews.com          | $11   |
| vclnews.com                          | $11   |
| varsityclublacrosse.news             | $25   |
| vcl.news                             | $25   |
