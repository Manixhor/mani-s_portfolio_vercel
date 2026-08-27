# Mani Portfolio - Next.js

A modern portfolio website built with Next.js, Prisma, and Tailwind CSS.

## Features

- 🚀 **Next.js 15** with App Router
- 🎨 **Tailwind CSS** for styling
- 🗄️ **Prisma ORM** with PostgreSQL
- 📱 **Responsive Design**
- 🌙 **Dark Mode Support**
- ⚡ **Server-Side Rendering**
- 🔒 **Security Headers**
- 📊 **Analytics Tracking**
- 📬 **Contact Form**

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use SQLite for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

4. Initialize the database:
```bash
npx prisma db push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Local Development (SQLite)

For local development, you can use SQLite:

1. Update `.env`:
```
DATABASE_URL="file:./dev.db"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Push the schema:
```bash
npx prisma db push
```

### Production (PostgreSQL)

For production, use PostgreSQL:

1. Set up a PostgreSQL database (Vercel Postgres, Supabase, etc.)

2. Update `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Push the schema:
```bash
npx prisma db push
```

## API Routes

- `GET /api/portfolio/config` - Get portfolio configuration
- `POST /api/contact/submit` - Submit contact form
- `POST /api/analytics/track` - Track page views

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel

3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string

4. Deploy!

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Open Prisma Studio
npm run db:studio

# Push database schema
npm run db:push

# Seed database
npm run db:seed
```

## License

MIT
# mani-s_portfolio_vercel
