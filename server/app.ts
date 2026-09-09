import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

export const app = express();

/* ------------------------------ security ------------------------------ */
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    // Dev default: reflect any origin. Production: set ALLOWED_ORIGINS in .env.
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);

app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: "Too many requests - please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  message: { message: "Too many booking requests - please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ------------------------------ middleware ----------------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(req.method, req.originalUrl);
    next();
  });
}

/* -------------------------------- routes ------------------------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("Brohi Dining API is live!");
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/booking", bookingLimiter, bookingRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);

/* ------------------------------ 404 + errors --------------------------- */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});
