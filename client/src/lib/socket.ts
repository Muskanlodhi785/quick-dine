import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Strip "/api" suffix if present to connect to root socket.io server
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");

    socket = io(serverUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
