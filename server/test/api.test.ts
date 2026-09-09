import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app.js";
import { User } from "../models/User.js";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Booking } from "../models/Booking.js";
import { BookingLock } from "../models/BookingLock.js";

const URI = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/quickdine_test";

const isoDaysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const suffix = Date.now().toString(36);

let ownerToken = "";
let dinerToken = "";
let owner2Token = "";
let approvedId = "";
let pendingId = "";
let tableA: any;
let tableB: any;

const register = (name: string, email: string, role?: string) =>
  request(app)
    .post("/api/auth/register")
    .send({ name, email, password: "Password123", phone: "03001234567", ...(role ? { role } : {}) });

const login = (email: string, password: string) =>
  request(app).post("/api/auth/login").send({ email, password });

before(async () => {
  await mongoose.connect(URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([
    User.syncIndexes(),
    Restaurant.syncIndexes(),
    Table.syncIndexes(),
    Booking.syncIndexes(),
    BookingLock.syncIndexes(),
  ]);

  const owner = await register("Owner One", `owner1_${suffix}@test.pk`, "owner");
  ownerToken = owner.body.token;
  const owner2 = await register("Owner Two", `owner2_${suffix}@test.pk`, "owner");
  owner2Token = owner2.body.token;
  const diner = await register("Diner One", `diner1_${suffix}@test.pk`);
  dinerToken = diner.body.token;

  const createVenue = async (token: string, name: string, extraSlots: string[]) => {
    const res = await request(app)
      .post("/api/owner/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .field("name", name)
      .field("description", "Test venue for the automated suite")
      .field("cuisine", "BBQ")
      .field("priceRange", "$$")
      .field("location", "Hyderabad, Sindh")
      .field("address", "Test Road, Latifabad, Hyderabad")
      .field("chef", "Test Chef")
      .field("tags", "Test,Suite")
      .field("availableSlots", extraSlots.join(","));
    return res.body;
  };

  const approved = await createVenue(ownerToken, `Brohi Test House ${suffix}`, ["18:00", "19:00", "20:00", "21:00"]);
  approvedId = approved._id;
  // Simulate the admin approval (admin panel is out of scope for this suite).
  await Restaurant.updateOne({ _id: approvedId }, { $set: { status: "approved" } });

  const pending = await createVenue(owner2Token, `Pending Venue ${suffix}`, ["18:00", "19:00"]);
  pendingId = pending._id;

  const ta = await Table.create({ restaurant: approvedId, tableNumber: "T1", capacity: 4 });
  const tb = await Table.create({ restaurant: approvedId, tableNumber: "T2", capacity: 4 });
  await Table.create({ restaurant: pendingId, tableNumber: "T1", capacity: 4 });
  tableA = ta;
  tableB = tb;
});

after(async () => {
  await mongoose.disconnect();
});

const date = isoDaysFromNow(3);
const book = (tableId: string, slot: string) =>
  request(app)
    .post("/api/booking")
    .set("Authorization", `Bearer ${dinerToken}`)
    .send({ restaurantId: approvedId, tableId, date, startTime: slot, partySize: 2 });

test("register clamps a client-requested admin role to user", async () => {
  const res = await register("Escalation", `esc_${suffix}@test.pk`, "admin");
  assert.equal(res.status, 201);
  assert.equal(res.body.role, "user");
});

test("logins succeed", () => {
  assert.ok(ownerToken);
  assert.ok(dinerToken);
  assert.ok(owner2Token);
});

test("availability serves an approved restaurant", async () => {
  const res = await request(app).get(`/api/restaurant/${approvedId}/availability`).query({ date, partySize: 2 });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some((s: any) => s.available));
  assert.ok(res.body[0].tables);
});

test("availability hides a pending restaurant", async () => {
  const res = await request(app).get(`/api/restaurant/${pendingId}/availability`).query({ date, partySize: 2 });
  assert.equal(res.status, 404);
});

test("booking is created pending with a reference code", async () => {
  const res = await book(tableA._id.toString(), "18:00");
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "pending");
  assert.ok(res.body.bookingId);
  assert.ok(res.body.table.tableNumber);
});

test("a duplicate booking for the same table/slot is rejected with 409", async () => {
  const dup = await book(tableA._id.toString(), "18:00");
  assert.equal(dup.status, 409);
});

test("concurrent identical requests -> exactly one succeeds", async () => {
  const [a, b] = await Promise.all([
    book(tableB._id.toString(), "19:00"),
    book(tableB._id.toString(), "19:00"),
  ]);
  const codes = [a.status, b.status].sort();
  assert.deepEqual(codes, [201, 409]);
});

test("owner can confirm a pending booking, then completed/cancel rules hold", async () => {
  const mine = await request(app).get("/api/booking/my").set("Authorization", `Bearer ${dinerToken}`);
  const booking = mine.body.find((x: any) => x.table._id.toString() === tableA._id.toString() && x.startTime === "18:00");

  const confirm = await request(app)
    .put(`/api/owner/bookings/${booking._id}/status`)
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ status: "confirmed" });
  assert.equal(confirm.status, 200);
  assert.equal(confirm.body.status, "confirmed");

  const reject = await request(app)
    .put(`/api/owner/bookings/${booking._id}/status`)
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ status: "cancelled" });
  assert.equal(reject.status, 200);
  assert.equal(reject.body.status, "cancelled");

  const reConfirm = await request(app)
    .put(`/api/owner/bookings/${booking._id}/status`)
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ status: "confirmed" });
  assert.equal(reConfirm.status, 400);
});

test("cancelled booking frees the slot for rebooking", async () => {
  const rebook = await book(tableA._id.toString(), "18:00");
  assert.equal(rebook.status, 201);
  // clean up so it doesn't interfere with nothing else (suite is done with this slot)
  await Booking.updateOne({ _id: rebook.body._id }, { $set: { status: "cancelled" } });
});

test("a customer cannot update booking status (role + ownership)", async () => {
  const res = await request(app)
    .put(`/api/owner/bookings/${tableB._id}/status`)
    .set("Authorization", `Bearer ${dinerToken}`)
    .send({ status: "confirmed" });
  assert.ok(res.status === 401 || res.status === 403);
});

test("an owner cannot touch another venue's data", async () => {
  const owner2Bookings = await request(app)
    .get("/api/owner/bookings")
    .set("Authorization", `Bearer ${owner2Token}`);
  // Owner 2 has a restaurant but no bookings; must be an empty array (200).
  assert.equal(owner2Bookings.status, 200);
  assert.equal(owner2Bookings.body.length, 0);
});
