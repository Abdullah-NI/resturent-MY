# Sky Lounge Restaurant - Premium MERN Web Application

A full-stack, production-ready, high-performance web application built for **Sky Lounge Restaurant** in Deoband, Uttar Pradesh, India.

---

## Business Information

- **Restaurant Name**: SKY LOUNGE RESTAURANT
- **Location**: 2nd Floor, Opposite Punjab National Bank, Railway Road, Teachers Colony, Deoband - 247554, Uttar Pradesh, India
- **Phone / Delivery / WhatsApp**: 9760999444
- **Opening Hours**: Every day: 12:00 PM - 10:30 PM
- **Cuisine**: Premium 100% Vegetarian Multi-Cuisine (North Indian, Chinese, Italian, South Indian Dosa, Kebabs, Desserts, Mocktails)

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Axios, Lucide React, React Icons, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT (HTTP-Only Cookies), bcryptjs, Helmet, Express Rate Limit, Cookie Parser, CORS, Morgan.

---

## Project Structure

```
sky-lounge/
├── frontend/             # React single page application with admin panel
│   ├── src/
│   │   ├── assets/       # Media & graphics
│   │   ├── components/   # Navbar, Footer, FoodCard, QuickViewModal, Admin UI
│   │   ├── context/      # AuthContext, CartContext, ToastContext
│   │   ├── layouts/      # PublicLayout, AdminLayout
│   │   ├── pages/        # 31 Public & Admin pages
│   │   ├── routes/       # ProtectedRoute, AdminRoute, AppRoutes
│   │   ├── services/     # Axios API Client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Node.js + Express REST API server
│   ├── src/
│   │   ├── config/       # MongoDB Mongoose connection
│   │   ├── controllers/  # Auth, Menu, Category, Order, Reservation, Review, Gallery, Admin
│   │   ├── middleware/   # requireAuth, requireRole, errorHandler, rateLimiter
│   │   ├── models/       # User, Category, MenuItem, Order, Reservation, Review, Gallery, Settings
│   │   ├── routes/       # REST API endpoints
│   │   ├── utils/        # Seed script (255 PDF dishes), JWT token generator
│   │   ├── validators/   # Zod request validators
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Populates MongoDB with all 19 categories and 255 PDF menu items
npm run dev      # Starts API server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Admin Credentials

- **Admin Portal**: `http://localhost:5173/admin/login`
- **Default Email**: `admin@skylounge.com`
- **Default Password**: `AdminPass123!`

---

## Verification & Testing Checklist

- [x] **Authentication**: Register, Login, Logout, JWT HTTP-Only Cookies, bcrypt hashing, User & Admin role protection.
- [x] **Menu & PDF Accuracy**: All 19 categories and 255 menu items extracted directly from PDF with exact names and prices.
- [x] **Cart & Checkout**: Persistent cart, portion selectors, free delivery calculation, cash on delivery (COD) & pay at restaurant options.
- [x] **Live Order Tracking**: Interactive step-by-step progress timeline.
- [x] **Table Reservation**: Online booking form with date/time selection.
- [x] **Customer Reviews & Moderation**: Public approved reviews and admin moderation panel.
- [x] **Admin SaaS Dashboard**: Real-time sales revenue, pending orders, user management, dish CRUD, category management, gallery & restaurant settings.
- [x] **Security**: HTTP-Only cookies, CORS with credentials, Helmet headers, Rate limiting, MongoDB injection protection, server-side RBAC.
