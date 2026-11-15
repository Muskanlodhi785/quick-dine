import { model, Schema } from "mongoose";
const tableSchema = new Schema({
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
tableSchema.virtual("restaurantId").get(function () {
    return this.restaurant;
});
// A restaurant can only have one table per table number.
tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });
// The hot query path: find active tables for a restaurant.
tableSchema.index({ restaurant: 1, isActive: 1 });
export const Table = model("Table", tableSchema);
