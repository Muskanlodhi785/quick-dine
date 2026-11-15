import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";

const notificationRouter = Router();

notificationRouter.use(protect);

notificationRouter.get("/", getMyNotifications);
notificationRouter.put("/read-all", markAllNotificationsRead);
notificationRouter.put("/:id/read", markNotificationRead);

export default notificationRouter;
