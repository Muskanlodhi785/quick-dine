import { model, Schema } from "mongoose";
const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["booking_created", "booking_confirmed", "booking_cancelled", "booking_completed", "system"],
        default: "system",
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    link: {
        type: String,
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
});
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
export const Notification = model("Notification", notificationSchema);
