# CleanStride API (malesin_shoescare Backend)

Robust backend RESTful API built with **Node.js**, **Express**, **Prisma ORM**, and **MySQL**. It serves as the data and logic engine for the CleanStride (malesin_shoescare) shoecare management system, managing customer bookings, order status workflows, service catalog cataloging, dashboard analytics, and AI integrations.

---

## 🚀 Key Features

1. **Customer Bookings**: Automatically identifies/creates customers by their unique phone number, preventing duplicate database entries.
2. **Order Workflows & Status Progression**: Manages the complete lifecycle of orders:
   `PENDING` ➔ `PICKUP` ➔ `PROCESSING` ➔ `QC` ➔ `READY` ➔ `DELIVERY` ➔ `COMPLETED` ➔ `CANCELLED`.
   Automated timeline event logs keep customers updated.
3. **Interactive Service Catalog CRUD**: Categorizes services (e.g., *Cleaning*, *Repair*, *Unyellowing*, *Repaint*) with visual image support and status toggles.
4. **OpenRouter AI Service Recommendations**:
   - **Text-based Recommendation**: Input material & condition to get cleaning suggestions.
   - **Vision-based Image Analysis**: Upload a shoe image for AI Vision model to analyze condition, recommend a service, and estimate confidence.
5. **Dashboard Analytics**: Generates KPI aggregates and structured time-series data for front-end charts (Orders by Status, Service Popularity).
6. **Self-Documenting API**: Integrated Swagger UI for live endpoint exploration and manual API testing.

---

## 🛠️ Technology Stack

- **Runtime & Server**: Node.js & Express.js
- **Database ORM**: Prisma ORM with MySQL
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` encryption
- **File Uploads**: `multer` for handling service uploads and AI temporary images
- **Artificial Intelligence**: [OpenRouter API](https://openrouter.ai/) for model-independent recommendations and analysis (fallback support included)
- **API Documentation**: `swagger-jsdoc` & `swagger-ui-express`
- **Validation**: Schema-based type validation using `zod`

---

## 📁 Project Structure

```text
cleanstride-api/
├── prisma/
│   ├── schema.prisma       # Prisma database design (User, Customer, Category, Service, Order, Timeline)
│   ├── seed.js             # Initial database seed for Categories and Service catalog
│   └── migrations/         # Database migration history files
├── src/
│   ├── config/             # Environment, static, upload, and swagger configuration settings
│   ├── controllers/        # Express request controllers (Auth, Service, Order, Tracking, AI, Analytics)
│   ├── middleware/         # Middleware wrappers (JWT Authentication, Validation, Global Error Handler)
│   ├── routes/             # Route configurations mapping URLs to controllers
│   ├── services/           # External service handlers (e.g. OpenRouter AI Service)
│   ├── app.js              # Express app initialization and routes binding
│   └── server.js           # Main application entry point
├── uploads/                # Directory storing static files and service icons
├── .env.example            # Template file for setting up local environment variables
├── package.json            # NPM scripts, dependencies and project details
└── README.md               # Main project documentation
```

---

## 🏁 Getting Started

### 1. Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (v5.7+ or v8.x)

---

### 2. Installation

Clone this repository to your local directory, navigate into it, and install dependencies:

```bash
# Navigate to project folder
cd cleanstride-api

# Install dependencies
npm install
```

---

### 3. Environment Variables Configuration

Create a `.env` file in the root directory by copying the `.env.example` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your local variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database URL
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/cleanstride"

# JWT Auth Secret Key
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# OpenRouter AI API Key & Model (Required for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

---

### 4. Database Setup & Migrations

Make sure your MySQL server is running, and create a database named `cleanstride` (or match whatever database name you specify in `DATABASE_URL`).

Run the migrations to create the database tables, and seed the database with initial categories and services:

```bash
# Run Prisma Migrations
npx prisma migrate dev

# Seed database with initial data
npm run db:seed
```

---

### 5. Running the Application

You can start the Express server in development mode (which automatically restarts when code files change):

```bash
# Run development server
npm run dev
```

The console will output:
```text
CleanStride API running on http://localhost:3000
Environment: development
```

---

## 📖 API Documentation & Swagger

When the backend server is running, you can access the interactive Swagger API documentation at:

👉 [**http://localhost:3000/api-docs**](http://localhost:3000/api-docs)

You can explore request payloads, try out endpoints, and check details of available endpoints directly from your browser.

---

## 🔒 Test Accounts

For testing the protected admin routes (via Swagger or the Admin frontend app):

- **Username / Email**: `admin@cleanstride.com`
- **Password**: `password`

---

## 📌 Endpoint Reference

### Public API (No authentication needed)
- **Get Health Status**: `GET /`
- **List Service Catalog**: `GET /services`
- **List Service Categories**: `GET /services/categories`
- **Create Customer Booking**: `POST /orders`
- **Track Order Live**: `GET /track/:orderCode`
- **AI Service Recommendation (Text-based)**: `POST /ai/recommend`
- **AI Shoe Condition Analysis (Vision-based)**: `POST /ai/analyze`

### Admin API (JWT Auth token required in header as Bearer Token)
- **Admin Log in**: `POST /auth/login`
- **List All Orders (Search, Filter & Paginate)**: `GET /orders`
- **Update Order Status & Step**: `PATCH /orders/:id/status`
- **List Services (Including Inactive)**: `GET /services/admin`
- **Add New Service**: `POST /services` *(Supports image file upload)*
- **Modify Service Details**: `PUT /services/:id` *(Supports image file upload)*
- **Toggle Service Active Status**: `PATCH /services/:id/toggle`
- **Remove Service**: `DELETE /services/:id`
- **Get Dashboard Analytics**: `GET /analytics/dashboard`

---

## 📝 License

Private - malesin_shoescare © 2026
