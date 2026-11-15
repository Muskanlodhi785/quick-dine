import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api.ts";
import { getSocket } from "../lib/socket.ts";
import { useAppContext } from "../context/AppContext.tsx";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/notifications");
        if (!active) return;
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    const socket = getSocket();
    socket.emit("join_user", user._id);

    const onNewNotification = (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_notification", onNewNotification);

    return () => {
      active = false;
      socket.off("new_notification", onNewNotification);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-ink/75 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-surface-container-low/50"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-primary rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-raised border border-outline-variant/60 shadow-xl rounded-xl z-50 overflow-hidden zoom-in-95">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] flex items-center gap-1 text-ink/60 hover:text-primary transition-colors cursor-pointer"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/15">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink/50">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink/50 italic">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => {
                const isConfirmed = notif.type === "booking_confirmed";
                const isCancelled = notif.type === "booking_cancelled";

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleItemClick(notif)}
                    className={`px-4 py-3 text-left transition-colors cursor-pointer hover:bg-surface-container-low/30 ${
                      !notif.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isConfirmed ? (
                          <CheckCircle size={15} className="text-secondary" />
                        ) : isCancelled ? (
                          <AlertCircle size={15} className="text-error" />
                        ) : (
                          <Info size={15} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-primary truncate">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-ink/75 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[9px] text-ink/45">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(notif);
                              }}
                              className="text-secondary hover:underline font-medium"
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
