import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Notification } from "../models/Notification.js";

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(40);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user?._id,
      isRead: false,
    });
    res.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load notifications" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user?._id },
      { isRead: true },
      { returnDocument: "after" }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.json(notification);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not update notification" });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user?._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not mark all notifications as read" });
  }
};
