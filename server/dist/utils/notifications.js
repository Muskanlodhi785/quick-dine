import nodemailer from "nodemailer";
import { Notification } from "../models/Notification.js";
import { emitNotification } from "./socket.js";
// Configurable Nodemailer transporter (with test/fallback logger)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}
export const createAndSendNotification = async (options) => {
    try {
        // 1. In-App Notification Record in MongoDB
        const notification = await Notification.create({
            recipient: options.recipientId,
            sender: options.senderId,
            type: options.type,
            title: options.title,
            message: options.message,
            link: options.link,
            isRead: false,
        });
        // 2. Real-Time Socket.io Push
        emitNotification(options.recipientId, notification);
        // 3. Email Notification (Real or Dev Fallback Logger)
        if (options.recipientEmail) {
            const emailSubject = `QuickDine: ${options.title}`;
            const emailBody = `Hello ${options.recipientName || "Valued Guest"},\n\n${options.message}\n\nView details: ${options.link ? `${process.env.CLIENT_URL || "http://localhost:5173"}${options.link}` : "QuickDine"}\n\nBest regards,\nQuickDine Brohi Team`;
            if (transporter) {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"QuickDine" <no-reply@quickdine.pk>',
                    to: options.recipientEmail,
                    subject: emailSubject,
                    text: emailBody,
                });
            }
            else {
                console.log(`[EMAIL NOTIFICATION TO: ${options.recipientEmail}] ${emailSubject} | ${options.message}`);
            }
        }
    }
    catch (err) {
        // Notification failure must never fail the underlying transaction/booking
        console.error("Failed to dispatch notification:", err);
    }
};
