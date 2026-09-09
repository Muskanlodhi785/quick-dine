import { randomBytes } from "crypto";
import { Document, model, Schema, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface IBooking extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  table: Types.ObjectId;
  date: string; // "YYYY-MM-DD" (local day, timezone-safe)
  startTime: string; // "HH:mm" (24h)
  endTime: string; // "HH:mm" (24h)
  partySize: number;
  notes?: string;
  status: BookingStatus;
  bookingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Speeds up conflict queries: active bookings for a table on a day.
bookingSchema.index({ table: 1, date: 1, status: 1, startTime: 1 });
// Venue calendar view (owner/admin) and customer dashboard lookups.
bookingSchema.index({ restaurant: 1, date: 1, status: 1, startTime: 1 });
bookingSchema.index({ user: 1, date: -1, startTime: -1 });

bookingSchema.pre("save", function () {
  if (!this.bookingId) {
    this.bookingId = `GR-${randomBytes(4).toString("hex").toUpperCase()}`;
  }
});

export const Booking = model<IBooking>("Booking", bookingSchema);
