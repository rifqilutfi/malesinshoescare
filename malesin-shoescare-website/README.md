# malesin_shoescare Website

A production-ready monorepo for **malesin_shoescare** shoe cleaning service in Malang, featuring a neo-brutalist landing page and admin dashboard.

## 🏗️ Project Structure

```
malesin-shoescare/
├── apps/
│   ├── landing/          # Public landing page (Vite + React)
│   └── admin/            # Admin dashboard (Vite + React)
├── packages/
│   └── ui/               # Shared UI components
└── pnpm-workspace.yaml   # Workspace configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:landing    # http://localhost:5173
pnpm dev:admin      # http://localhost:5174
```

## 📱 Apps

### Landing Page (`apps/landing`)

- Neo-brutalist design
- Services showcase from API
- Online booking form
- Gallery carousel
- WhatsApp & Instagram integration

### Admin Dashboard (`apps/admin`)

- Order management (CRUD)
- Service management
- Transaction reports
- Export PDF/Excel/CSV
- Photo upload

## 🔗 Backend API

Requires [cleanstride-api](https://github.com/kayeprojects/cleanstride-api) running on `http://localhost:8000`

## 🛠️ Tech Stack

- React 18, Vite, TypeScript
- Tailwind CSS, Radix UI
- pnpm workspaces

## 📝 License

Private - malesin_shoescare © 2025
