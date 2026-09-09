import { Types } from "mongoose";
import { Booking } from "../models/Booking.js";
import { BookingLock } from "../models/BookingLock.js";

export const MEAL_DURATION_MIN = 90;

const pad2 = (n: number): string => String(n).padStart(2, "0");

export const todayLocalISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export const isValidDateISO = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const isValidTime = (s: unknown): s is string =>
  typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

const timeToMin = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Add minutes to a "HH:mm" time, wrapping past midnight if needed. */
export const addMinutes = (time: string, minutes: number): string => {
  const total = timeToMin(time) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
};

/** Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). "HH:mm" strings compare correctly when zero-padded. */
export const rangesOverlap = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean => aStart < bEnd && bStart < aEnd;

export interface IConflictQuery {
  tableId: Types.ObjectId | string;
  date: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: Types.ObjectId | string;
}

/**
 * Look for an active (pending/confirmed) booking on the same table and day whose
 * [startTime, endTime) overlaps the requested window.
 */
export const findConflictingBooking = async ({
  tableId,
  date,
  startTime,
  endTime,
  excludeBookingId,
}: IConflictQuery) =>
  Booking.findOne({
    table: tableId,
    date,
    status: { $in: ["pending", "confirmed"] },
    _id: excludeBookingId ? { $ne: excludeBookingId } : { $exists: true },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Serialize concurrent booking attempts per (table, day).
 * Uses an insert-if-absent lock document; returns false if another request holds the lock.
 */
export const acquireTableLock = async (
  tableId: Types.ObjectId | string,
  date: string
): Promise<boolean> => {
  const key = `${tableId.toString()}_${date}`;
  const MAX_ATTEMPTS = 8;
  const RETRY_MS = 120;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      await BookingLock.create({ key });
      return true;
    } catch (err: any) {
      if (err && err.code === 11000) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await sleep(RETRY_MS);
          continue;
        }
        return false;
      }
      throw err;
    }
  }
  return false;
};

export const releaseTableLock = async (
  tableId: Types.ObjectId | string,
  date: string
): Promise<void> => {
  try {
    await BookingLock.deleteOne({ key: `${tableId.toString()}_${date}` });
  } catch {
    /* TTL will expire the lock anyway */
  }
};
