import "dotenv/config";
import http from "http";
import { app } from "./app.js";
import connectDB from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";
import { initSocket } from "./utils/socket.js";

await connectDB();
initCloudinary();

const port = Number(process.env.PORT) || 5000;
const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Velvet Table server running at http://localhost:${port}`);
});
