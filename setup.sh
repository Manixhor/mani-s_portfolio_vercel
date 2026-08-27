#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Setting up Portfolio Next.js..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version $NODE_VERSION detected. Please install Node.js 18+."
  exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Create .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
else
  echo "✅ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Approve Prisma install scripts
echo ""
echo "🔧 Setting up Prisma..."
npm install-scripts approve prisma @prisma/client @prisma/engines 2>/dev/null || true

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed sample data
echo ""
echo "🌱 Seeding sample data..."
node prisma/seed.js

echo ""
echo "============================================"
echo "✅ Setup complete!"
echo "============================================"
echo ""
echo "Run the dev server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo ""
echo "For production build:"
echo "  npm run build"
echo "  npm run start"
echo ""
