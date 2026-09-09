import { Router } from "express";
import {
  createOwnerRestaurant,
  updateBookingStatus,
  getOwnerRestaurant,
  updateOwnerRestaurant,
  getOwnerBookings,
  getOwnTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/ownerController.js";
import upload from "../config/multer.js";
import { ownerOnly, protect } from "../middlewares/auth.js";

const ownerRouter = Router();
ownerRouter.use(protect);
ownerRouter.use(ownerOnly);

ownerRouter.get("/restaurants", getOwnerRestaurant);
ownerRouter.post("/restaurants", upload.single("image"), createOwnerRestaurant);
ownerRouter.put("/restaurants", upload.single("image"), updateOwnerRestaurant);

ownerRouter.get("/tables", getOwnTables);
ownerRouter.post("/tables", createTable);
ownerRouter.put("/tables/:id", updateTable);
ownerRouter.delete("/tables/:id", deleteTable);

ownerRouter.get("/bookings", getOwnerBookings);
ownerRouter.put("/bookings/:id/status", updateBookingStatus);

export default ownerRouter;
