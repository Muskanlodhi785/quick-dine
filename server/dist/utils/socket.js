import { Server } from "socket.io";
let io = null;
export const initSocket = (httpServer) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins.length ? allowedOrigins : true,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        // Client can authenticate/join user room
        socket.on("join_user", (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
            }
        });
        // Client can join restaurant room (e.g. owner or live availability listener)
        socket.on("join_restaurant", (restaurantId) => {
            if (restaurantId) {
                socket.join(`restaurant:${restaurantId}`);
            }
        });
        socket.on("leave_restaurant", (restaurantId) => {
            if (restaurantId) {
                socket.leave(`restaurant:${restaurantId}`);
            }
        });
    });
    return io;
};
export const getIO = () => io;
/** Broadcast availability change for a restaurant on a given date to all listening viewers */
export const emitAvailabilityUpdated = (restaurantId, date) => {
    if (io) {
        io.to(`restaurant:${restaurantId}`).emit("availability_updated", { restaurantId, date });
        io.emit("global_availability_tick", { restaurantId, date });
    }
};
/** Broadcast booking event to the restaurant owner and customer */
export const emitBookingEvent = (eventType, payload) => {
    if (io) {
        if (payload.restaurantId || payload.restaurant?._id) {
            const restId = (payload.restaurantId || payload.restaurant?._id).toString();
            io.to(`restaurant:${restId}`).emit(eventType, payload);
        }
        if (payload.userId || payload.user?._id) {
            const uId = (payload.userId || payload.user?._id).toString();
            io.to(`user:${uId}`).emit(eventType, payload);
        }
    }
};
/** Send real-time notification to a specific user */
export const emitNotification = (userId, notification) => {
    if (io && userId) {
        io.to(`user:${userId}`).emit("new_notification", notification);
    }
};
