import { Document, model, Schema } from "mongoose";

export interface IBookingLock extends Document {
  key: string; // `${tableId}_${YYYY-MM-DD}`
  createdAt: Date;
}

/**
 * Lightweight per-(table, day) mutex used to serialize booking creation so the
 * overlap check + insert is atomic even on a standalone MongoDB (no transactions).
 * Documents expire automatically ~90s after creation (TTL index), so a crashed
 * request can never permanently block a table.
 */
const bookingLockSchema = new Schema<IBookingLock>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90,
  },
});

export const BookingLock = model<IBookingLock>("BookingLock", bookingLockSchema);
