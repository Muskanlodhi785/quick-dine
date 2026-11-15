import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
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

  io.on("connection", (socket: Socket) => {
    // Client can authenticate/join user room
    socket.on("join_user", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Client can join restaurant room (e.g. owner or live availability listener)
    socket.on("join_restaurant", (restaurantId: string) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}`);
      }
    });

    socket.on("leave_restaurant", (restaurantId: string) => {
      if (restaurantId) {
        socket.leave(`restaurant:${restaurantId}`);
      }
    });
  });

  return io;
};

export const getIO = (): Server | null => io;

/** Broadcast availability change for a restaurant on a given date to all listening viewers */
export const emitAvailabilityUpdated = (restaurantId: string, date: string): void => {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit("availability_updated", { restaurantId, date });
    io.emit("global_availability_tick", { restaurantId, date });
  }
};

/** Broadcast booking event to the restaurant owner and customer */
export const emitBookingEvent = (
  eventType: "booking_created" | "booking_updated" | "booking_cancelled",
  payload: any
): void => {
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
export const emitNotification = (userId: string, notification: any): void => {
  if (io && userId) {
    io.to(`user:${userId}`).emit("new_notification", notification);
  }
};
