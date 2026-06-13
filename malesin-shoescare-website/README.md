# CleanStride Wash Hub (malesin_shoescare Frontends)

This repository contains the front-end applications for **CleanStride (malesin_shoescare)**, a modern shoecare management system. Built as a **pnpm monorepo**, it houses both the customer-facing landing website and the internal admin dashboard.

---

## 🏗️ Project Structure

```text
malesin-shoescare-website/
├── apps/
│   ├── landing/          # Public customer website (Service catalog, Booking, Tracking, AI Recommendations)
│   └── admin/            # Internal admin dashboard (Order tracking, Service CRUD, Interactive charts, Reports)
├── packages/
│   └── ui/               # Shared components, hooks and styling utils
├── package.json          # Workspace dependency definitions and orchestrator commands
├── pnpm-workspace.yaml   # pnpm workspace monorepo layout definition
└── README.md             # Main front-end documentation
```

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) & [Vite](https://vitejs.dev/) for extremely fast development builds
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for layout and visual styling
- **Workspaces Manager**: [pnpm](https://pnpm.io/) for efficient package management
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Reports**: [Recharts](https://recharts.org/) for business insights
- **Data Exporting**: [jsPDF](https://github.com/parallax/jsPDF) and [XLSX](https://github.com/SheetJS/sheetjs) for exporting reports
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🏁 Getting Started

### 1. Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [pnpm](https://pnpm.io/installation) package manager (`npm install -g pnpm`)

---

### 2. Installation

Install all dependencies across the entire monorepo workspace from the root folder:

```bash
# Navigate to the frontend directory
cd malesin-shoescare-website

# Install all workspace dependencies
pnpm install
```

---

### 3. Environment Variables Configuration

Both apps connect to the backend API running at `http://localhost:3000`. You must configure their API URLs.

Create a `.env` file in the root of **both** `apps/landing` and `apps/admin` (or copy `.env.example` in each):

#### For Landing Website (`apps/landing/.env`)
```env
VITE_API_URL=http://localhost:3000
```

#### For Admin Dashboard (`apps/admin/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

### 4. Running the Development Servers

You can launch both applications concurrently or run them individually. Run the commands from the root directory:

```bash
# Option A: Start BOTH Landing and Admin servers concurrently
pnpm dev:all

# Option B: Start ONLY the Landing Website
pnpm dev:landing

# Option C: Start ONLY the Admin Dashboard
pnpm dev:admin
```

#### Local Server URLs:
- **Landing Website**: [**http://localhost:5173**](http://localhost:5173)
- **Admin Dashboard**: [**http://localhost:5174**](http://localhost:5174)

---

## 📱 Application Modules & Features

### 🌟 1. Customer Landing Website (`apps/landing`)
Designed as a modern, high-conversion interface for customers to browse services and check on their shoes.
- **Service Catalog**: Dynamically fetches active cleaning categories & services from the API.
- **Online Booking Form**: A multi-step form where customers input contact details, choose services, specify shoe types, select dates/times, and book orders.
- **Live Order Tracking**: Search by Order Number (e.g. `CLS-XXXXXXXX`) to see progress bar percentages and an interactive timeline. Includes a direct WhatsApp link to message the store about an order.
- **AI Recommendation Engine**: A dual-feature tabbed system:
  1. **Text Recommendation**: Input shoe material (e.g. Leather, Canvas, Suede) and dirt condition (e.g. Light, Medium, Heavy) to suggest the ideal cleaning package.
  2. **Vision Analysis**: Upload a picture of a shoe; OpenRouter AI processes the image to diagnose issues, recommend a service, and display a confidence score.

### 🛡️ 2. Admin Dashboard (`apps/admin`)
A dashboard for shoecare workers to track operations, update order status, manage services, and view analytics reports.
- **Admin Authentication**: Secure login using JWT tokens.
- **Order Management**: Searchable, paginated table of orders. Staff can click an order to view full details (customer contact, billing breakdown, notes, timeline logs) and update the order status (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED`, etc.) which auto-advances the timeline.
- **Service Management (CRUD)**: Create, edit, toggle visibility, and delete services. Supports uploading service thumbnail images directly to the API server.
- **Interactive Analytics Dashboard**:
  - Summarizes key KPIs (Total Orders, Completed Orders, Estimated Revenue, Top Service Package).
  - Renders visual charts (Recharts) for *Orders by Status* and *Service Popularity*.
  - Offers data exporting: generate and download professional **PDF** receipts or export list reports as **Excel (XLSX)** spreadsheets.

---

## 📝 License

Private - malesin_shoescare © 2026
