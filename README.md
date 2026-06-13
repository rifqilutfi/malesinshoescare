# CleanStride: Malesin Shoescare Management System

Welcome to the main repository for **Malesin Shoescare (CleanStride)**, a professional shoe cleaning and laundry management system. This repository contains both the API backend and the multi-app frontend client.

---

## 📁 Repository Structure

The codebase is split into two primary folders:

```text
malesinshoescare/
├── cleanstride-api/             # Node.js & Express API Backend
│   ├── prisma/                  # MySQL schema database & seeds
│   └── README.md                # Backend-specific documentation & setup
│
└── malesin-shoescare-website/   # Monorepo containing all client-side applications
    ├── apps/
    │   ├── landing/             # Customer-facing website (Booking, Tracking, AI recommendations)
    │   └── admin/               # Internal staff workspace (Order manager & analytics)
    └── README.md                # Frontend-specific documentation & setup
```

---

## 🚀 Quick Setup & Run Guide

To run the entire system locally, follow these steps:

### 1. Database & Backend API Setup

1. Navigate to the API folder:
   ```bash
   cd cleanstride-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (`.env`) using the template:
   ```bash
   cp .env.example .env
   ```
4. Run migrations and seed data:
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

*The API will be available at `http://localhost:3000`. You can access the Swagger documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).*

---

### 2. Frontend Client Setup

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd malesin-shoescare-website
   ```
2. Install the workspace dependencies:
   ```bash
   pnpm install
   ```
3. Configure the environment variables (`.env`) for both apps:
   * Create `apps/landing/.env` and `apps/admin/.env` containing:
     ```env
     VITE_API_URL=http://localhost:3000
     ```
4. Run both apps concurrently:
   ```bash
   pnpm dev:all
   ```

*The customer landing site will run on [http://localhost:5173](http://localhost:5173) and the admin dashboard on [http://localhost:5174](http://localhost:5174).*

---

## 🔒 Default Test Accounts

To log into the Admin Dashboard or execute authorized endpoints on the Swagger UI:

* **Email**: `admin@cleanstride.com`
* **Password**: `password`

---

## 📖 Sub-Project Documentation

For granular details, API endpoint structures, and frontend architecture notes, refer to:
* [API Backend Readme](file:///d:/Programming/malesinshoescare/cleanstride-api/README.md)
* [Frontend Client Readme](file:///d:/Programming/malesinshoescare/malesin-shoescare-website/README.md)
