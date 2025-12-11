# VCL Website

Your source for MCLA lacrosse coverage - news, rankings, transfers, and analysis.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (ready to configure)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd vcl-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vcl_website?schema=public"
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
vcl-website/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages (Home, Articles, Polls, etc.)
│   │   ├── admin/             # Admin panel (protected)
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # Header, Footer
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── services/          # Business logic services
├── prisma/
│   └── schema.prisma          # Database schema
└── public/
```

## Features

### Public Pages
- **Home** (`/`) - Landing page with featured content
- **Articles** (`/articles`) - News and analysis
- **Media Poll** (`/polls`) - Weekly team rankings
- **Transfers** (`/transfers`) - Player transfer tracker
- **About** (`/about`) - About VCL

### Admin Panel (`/admin`)
- **Dashboard** - Overview and quick actions
- **Articles** - Create, edit, publish articles
- **Polls** - Manage weekly media polls
- **Transfers** - Track player transfers
- **Teams** - Manage team database
- **Settings** - Site configuration

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/articles` | GET, POST | List/create articles |
| `/api/articles/[id]` | GET, PATCH, DELETE | Single article operations |
| `/api/teams` | GET, POST | List/create teams |
| `/api/teams/[id]` | GET, PATCH, DELETE | Single team operations |
| `/api/polls` | GET, POST | List/create poll weeks |
| `/api/polls/[id]` | GET, PATCH, DELETE | Single poll operations |
| `/api/polls/[id]/entries` | POST | Add poll entries |
| `/api/transfers` | GET, POST | List/create transfers |
| `/api/transfers/[id]` | GET, PATCH, DELETE | Single transfer operations |

## Database Schema

### Editorial Content
- **Article** - News articles and blog posts
- **Tag** - Article categorization
- **PollWeek** - Weekly poll container
- **PollEntry** - Individual team rankings
- **Transfer** - Player transfer records

### MCLA Data (Future-Ready)
- **Team** - Team database (manual + future MCLA API sync)
- **Game** - Game results (future MCLA API sync)

## Future: MCLA API Integration

The architecture is designed to easily integrate with the MCLA API when available:

1. Teams and Games tables have `mclaTeamId` and `mclaGameId` fields
2. `TeamService.syncFromMclaApi()` is stubbed and ready
3. Data flows through your API, not directly from external sources

## Deployment

Deploy to Vercel:
```bash
npm run build
```

Or use the Vercel CLI:
```bash
vercel
```

## License

MIT

```
vcl-website/
├── app/
│   ├── (public)/              # Public pages
│   │   ├── page.tsx           # Home
│   │   ├── articles/
│   │   ├── transfers/
│   │   ├── polls/
│   │   └── about/
│   ├── admin/                 # Admin panel (protected)
│   │   ├── layout.tsx
│   │   ├── articles/
│   │   ├── polls/
│   │   ├── transfers/
│   │   └── teams/
│   └── api/                   # Your API layer
│       ├── articles/
│       ├── polls/
│       ├── transfers/
│       ├── teams/
│       └── mcla/              # Future MCLA sync endpoints
├── lib/
│   ├── db/                    # Database client & queries
│   ├── services/              # Business logic (TeamService, etc.)
│   └── mcla/                  # Future MCLA API client
├── components/
│   ├── ui/                    # shadcn components
│   └── ...
└── supabase/
    └── migrations/            # SQL migrations
```