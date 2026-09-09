# QuickDine — AI-Powered Real-Time Multi-Restaurant Table Booking

A real-time restaurant table-booking platform for the SMIT hackathon brief: multiple independent restaurants list themselves, manage their **tables**, and customers reserve a specific table online — with **Gemini-powered recommendations** and **backend-guaranteed double-booking prevention**.

> Built for the "AI-Powered Real-Time Multi-Restaurant Table Booking Platform" hackathon (MERN, JWT, Cloudinary, Gemini).

---

## ✨ Features vs. the brief

| Hackathon requirement | Status | Where |
|---|---|---|
| JWT register/login + role-based access (customer / owner) | ✅ | `server/controllers/authController.ts` |
| Customer: browse → details → date/time + party size → available **tables** → book → view bookings | ✅ | Restaurant search/detail, table-aware availability, booking flow |
| Owner: add restaurant + image, **add/edit tables** with capacity, view bookings, **approve/reject** | ✅ | `ownerController.ts` + Owner dashboard |
| Cloudinary image upload storing secure URL + public ID | ✅ | `config/cloudinary.ts`, `ownerController.ts` |
| **Gemini AI assistant** (recommends only — never books) | ✅ | `GET /api/restaurant/recommend` |
| Booking stores customer, restaurant, **table**, party size, date, **start/end time**, status | ✅ | `models/Booking.ts`, `models/Table.ts` |
| Backend protection (no cross-user/owner access) | ✅ | `middlewares/auth.ts` + ownership checks everywhere |
| **Same table never double-booked (overlapping slot, concurrent-safe)** | ✅ | Per-(table,day) atomic lock + overlap check (`utils/bookings.ts`) |
| Responsive UI | ✅ | Mobile-adaptive layout |
| Bonus: admin approval, status flow, search filters | ✅ | Admin dashboard |

## 🗂 Monorepo layout

```
QuickDine/
├── client/            React 19 + Vite + TypeScript + Tailwind v4
│   └── src/           pages, components, context (auth), lib/api
├── server/            Express 5 + Mongoose 9 + TypeScript (ESM)
│   ├── config/        db, multer, cloudinary
│   ├── controllers/   auth, restaurant, booking, owner, admin
│   ├── models/        User, Restaurant, Table, Booking, BookingLock
│   ├── routes/        per-domain routers
│   ├── utils/         time math, overlap check, atomic table lock
│   └── seed.ts        demo users/restaurants/tables/bookings
└── .gitignore
```

## 🚀 Getting started

Prerequisites: **Node.js 18+**, **npm**, a running **MongoDB** (local `mongod` or Atlas).

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI, JWT_SECRET, etc.
npm run seed              # optional: load demo data (see "Demo accounts")
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
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` (or `CLOUDINARY_URL`) | server | restaurant image uploads |
| `GEMINI_API_KEY` (+ `GEMINI_MODEL`) | server | AI recommendations (optional — graceful DB fallback) |
| `VITE_API_URL` | client | API base URL (defaults to `http://localhost:5000/api`) |

## 👤 Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Customer | `diner@brohi.pk` | `Diner@1234` |
| Restaurant owner | `owner@brohi.pk` | `Owner@1234` |
| Admin | `admin@brohi.pk` | `Admin@1234` |

Seeded data: 6 approved Hyderabad (Sindh) restaurants - Brohi Restaurant flagship - all owned by the demo owner, 6 tables each (capacities 2–8), and sample bookings in the coming days so the dashboards look alive.

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

`GET /api/restaurant/recommend?cuisine=&location=&partySize=&preference=` returns restaurants from MongoDB ranked by Gemini with one-line reasons. The AI path performs **no writes** — it can never create or confirm a booking. Without a `GEMINI_API_KEY` it gracefully falls back to DB-ranked results (`source: "db-fallback"`).

## ✅ Verifying the demo

1. Open the client, log in as the **owner**, and confirm the restaurant/tables/bookings seed data appears.
2. Log out, log in as the **customer**, open a restaurant, pick a date/party size, choose a slot with a free table, and book it.
3. Log back in as the owner → **Approve** the pending booking.
4. Double-booking check: fire two identical booking requests for the same table/slot in parallel — exactly one succeeds (201), the other receives a 409 conflict message.

## ✅ Automated tests

The API suite (11 tests) covers the core guarantees and runs against a dedicated test database (quickdine_test) - your demo data is never touched:

```bash
cd server
npm test
```  
Optional: point at another Mongo with TEST_MONGODB_URI (default mongodb://127.0.0.1:27017/quickdine_test). Tests: role clamp, logins, availability (approved-only), booking create/duplicate 409, parallel double-booking -> exactly one 201 + one 409, owner approve/reject/completed transitions, cancel frees slot, role/ownership guards.
