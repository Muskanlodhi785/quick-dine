import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

await connectDB();
initCloudinary();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Lightweight request logger (dev only noise reduction kept minimal).
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(req.method, req.originalUrl);
    next();
  });
}

const port = Number(process.env.PORT) || 5000;

app.get("/", (_req: Request, res: Response) => {
  res.send("QuickDine API is live!");
});

app.use("/api/auth", authRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);

// JSON 404 for unknown API paths.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "API route not found" });
});

// Central error handler - never leak stack traces to clients.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`QuickDine server running at http://localhost:${port}`);
});
