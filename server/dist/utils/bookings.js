import { Booking } from "../models/Booking.js";
import { BookingLock } from "../models/BookingLock.js";
export const MEAL_DURATION_MIN = 90;
const pad2 = (n) => String(n).padStart(2, "0");
export const todayLocalISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
export const isValidDateISO = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isValidTime = (s) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const timeToMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};
/** Add minutes to a "HH:mm" time, wrapping past midnight if needed. */
export const addMinutes = (time, minutes) => {
    const total = timeToMin(time) + minutes;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${pad2(hh)}:${pad2(mm)}`;
};
/** True when a booking window would cross midnight (string order inverts). Such slots are not bookable. */
export const crossesMidnight = (startTime, minutes = MEAL_DURATION_MIN) => addMinutes(startTime, minutes) <= startTime;
/** Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). "HH:mm" strings compare correctly when zero-padded. */
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
/**
 * Look for an active (pending/confirmed) booking on the same table and day whose
 * [startTime, endTime) overlaps the requested window.
 */
export const findConflictingBooking = async ({ tableId, date, startTime, endTime, excludeBookingId, }) => Booking.findOne({
    table: tableId,
    date,
    status: { $in: ["pending", "confirmed"] },
    _id: excludeBookingId ? { $ne: excludeBookingId } : { $exists: true },
    $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * Serialize concurrent booking attempts per (table, day).
 * Uses an insert-if-absent lock document; returns false if another request holds the lock.
 */
export const acquireTableLock = async (tableId, date) => {
    const key = `${tableId.toString()}_${date}`;
    const MAX_ATTEMPTS = 8;
    const RETRY_MS = 120;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
            await BookingLock.create({ key });
            return true;
        }
        catch (err) {
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
export const releaseTableLock = async (tableId, date) => {
    try {
        await BookingLock.deleteOne({ key: `${tableId.toString()}_${date}` });
    }
    catch {
        /* TTL will expire the lock anyway */
    }
};
