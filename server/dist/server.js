import "dotenv/config";
console.log("🔥 NEW SERVER FILE IS RUNNING");
import express from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restaurantrouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
const app = express();
await connectDB();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log("➡️", req.method, req.originalUrl);
    next();
});
;
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.use('/api/auth', authRouter);
app.use('/api/restaurant', restaurantrouter);
app.use("/api/booking", bookingRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});
app.listen(port, () => {
    app.use((req, res, next) => {
        console.log("Request:", req.method, req.url);
        next();
    });
    console.log(`Server is running at http://localhost:${port}`);
});
