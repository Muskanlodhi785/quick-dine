import { Document, model, Schema, Types } from "mongoose";

export interface ITable extends Document {
  restaurant: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A restaurant can only have one table per table number.
tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });
// The hot query path: find active tables for a restaurant.
tableSchema.index({ restaurant: 1, isActive: 1 });

export const Table = model<ITable>("Table", tableSchema);
