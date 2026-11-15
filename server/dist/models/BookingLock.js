import { model, Schema } from "mongoose";
/**
 * Lightweight per-(table, day) mutex used to serialize booking creation so the
 * overlap check + insert is atomic even on a standalone MongoDB (no transactions).
 * Documents expire automatically ~90s after creation (TTL index), so a crashed
 * request can never permanently block a table.
 */
const bookingLockSchema = new Schema({
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
export const BookingLock = model("BookingLock", bookingLockSchema);
