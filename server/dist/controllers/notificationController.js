import { Notification } from "../models/Notification.js";
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user?._id })
            .sort({ createdAt: -1 })
            .limit(40);
        const unreadCount = await Notification.countDocuments({
            recipient: req.user?._id,
            isRead: false,
        });
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not load notifications" });
    }
};
export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user?._id }, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        res.json(notification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not update notification" });
    }
};
export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user?._id, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not mark all notifications as read" });
    }
};
