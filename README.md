# Velvet Table — Real-Time Multi-Restaurant Booking Platform

A real-time restaurant table-booking platform: multiple independent restaurants list themselves, manage their **tables**, and customers reserve a specific table online — with **Gemini-powered recommendations**, **Socket.io real-time updates**, **in-app/email notifications**, and **backend-guaranteed double-booking prevention**.

> Built for the "AI-Powered Real-Time Multi-Restaurant Table Booking Platform" hackathon (MERN, Socket.io, JWT, Cloudinary, Gemini).

---

## ✨ Features vs. the brief

| Hackathon requirement | Status | Where |
|---|---|---|
| JWT register/login + role-based access (customer / owner) | ✅ | `server/controllers/authController.ts` |
| Customer: browse → details → date/time + party size → available **tables** → book → view bookings | ✅ | Restaurant search/detail, table-aware availability, booking flow |
| Owner: add restaurant + image, **add/edit tables** with capacity, view bookings, **approve/reject** | ✅ | `ownerController.ts` + Owner dashboard |
| Real-time Socket.io live updates for bookings & availability | ✅ | `server/utils/socket.ts`, `client/src/lib/socket.ts` |
| In-app notification bell & email notifications (nodemailer) | ✅ | `server/controllers/notificationController.ts`, `NotificationBell.tsx` |
| Cloudinary image upload storing secure URL + public ID | ✅ | `config/cloudinary.ts`, `ownerController.ts` |
| **Gemini AI assistant** (recommends only — never books) | ✅ | `GET /api/restaurant/recommend` |
| Booking stores customer, restaurant, **table**, party size, date, **start/end time**, status | ✅ | `models/Booking.ts`, `models/Table.ts` |
| Backend protection (no cross-user/owner access) | ✅ | `middlewares/auth.ts` + ownership checks everywhere |
| **Same table never double-booked (overlapping slot, concurrent-safe)** | ✅ | Per-(table,day) atomic lock + overlap check (`utils/bookings.ts`) |
| Responsive UI | ✅ | Mobile-adaptive layout |
| Admin approval, status flow, search filters (cuisine, location, partySize) | ✅ | Admin dashboard, Search page |

## 🗂 Monorepo layout

```
VelvetTable/
├── client/            React 19 + Vite + TypeScript + Tailwind v4 + Socket.io-client
│   └── src/           pages, components, context (auth), lib/api, lib/socket
├── server/            Express 5 + Mongoose 9 + TypeScript (ESM) + Socket.io + Nodemailer
│   ├── config/        db, multer, cloudinary
│   ├── controllers/   auth, restaurant, booking, owner, admin, notification
│   ├── models/        User, Restaurant, Table, Booking, BookingLock, Notification
│   ├── routes/        per-domain routers
│   ├── utils/         time math, overlap check, atomic table lock, socket, notifications
│   └── seed.ts        demo users/restaurants/tables/bookings (16 restaurants)
└── .gitignore
```

## 🚀 Getting started

Prerequisites: **Node.js 18+**, **npm**, a running **MongoDB** (local `mongod` or Atlas).

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI, JWT_SECRET, etc.
npm run seed              # optional: load demo data (16 restaurants)
npm run server            # nodemon + tsx  → http://localhost:5000
```

> `npm run build` type-checks and compiles the server (`tsc`).

### 2. Client

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api by default
npm run dev               # Vite dev server → http://localhost:5173
```

### 3. Env vars (see the `.env.example` files)

| Var | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | JWT signing secret |
| `PORT` | server | API port (default **5000**) |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | server | restaurant image uploads |
| `GEMINI_API_KEY` (+ `GEMINI_MODEL`) | server | AI recommendations (optional — graceful DB fallback) |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | server | Email notifications (optional — console fallback) |
| `VITE_API_URL` | client | API base URL (defaults to `http://localhost:5000/api`) |

## 👤 Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Customer | `diner@velvettable.pk` | `Diner@1234` |
| Restaurant owner | `owner@velvettable.pk` | `Owner@1234` |
| Admin | `admin@velvettable.pk` | `Admin@1234` |

Seeded data: 16 approved diverse restaurants across Hyderabad & Sindh, 6 tables each (capacities 2–8), and sample bookings.

## 🔒 How double-booking is prevented (the important part)

1. Every table belongs to one restaurant and has a capacity (`models/Table.ts`).
2. Bookings store `date` (YYYY-MM-DD), `startTime`, `endTime` (default meal window = 90 min).
3. When a booking is created the server:
   - validates the restaurant is **approved**, the table **exists, is active and fits the party**;
   - acquires a **per-(table, day) atomic lock** (a TTL document, `models/BookingLock.ts`) so concurrent requests **serialize** — no TOCTOU gap;
   - inside the lock, rejects any **overlapping** pending/confirmed booking with a clear **409 conflict**;
   - only one of two simultaneous requests for the same table/slot can succeed.
4. Cancelled/completed bookings free the slot; owners approve (`pending → confirmed`), reject (`→ cancelled`) or complete bookings.

## 🧠 Gemini AI

`GET /api/restaurant/recommend?cuisine=&location=&partySize=&preference=` returns restaurants from MongoDB ranked by Gemini with one-line reasons. Without a `GEMINI_API_KEY` it gracefully falls back to DB-ranked results (`source: "db-fallback"`).

## ✅ Automated tests

The API suite (13 tests) covers the core guarantees, search filters, and notifications:

```bash
cd server
npm test
```
