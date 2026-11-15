/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Calendar, Users, Clock, Armchair, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api.ts";
import { formatDateShort, formatTime12 } from "../../lib/format.ts";

interface OwnerBookingsProps {
    bookings: any[];
    setBookings: React.Dispatch<React.SetStateAction<any[]>>;
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-400/15 text-amber-300",
    confirmed: "bg-sky-400/15 text-sky-300",
    completed: "bg-emerald-400/15 text-emerald-300",
    cancelled: "bg-error-container text-on-error-container",
};

export default function OwnerBookings({ bookings, setBookings }: OwnerBookingsProps) {
    const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            await api.put(`/owner/bookings/${bookingId}/status`, { status: newStatus });
            setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b)));
            toast.success(`Booking marked ${newStatus}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Update status failed");
        }
    };

    return (
        <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-medium text-primary">Reservations</h3>
                <span className="text-xs text-ink/65">
                    {bookings.filter((b) => b.status === "pending").length} pending
                </span>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-raised border border-outline-variant/10 p-12 text-center rounded-md">
                    <Calendar size={32} className="mx-auto text-ink/30 mb-2" />
                    <p className="text-xs text-ink/65 italic">No booking records found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((b) => (
                        <div
                            key={b._id}
                            className="bg-raised border border-outline-variant/20 rounded-md p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h4 className="font-display text-base font-medium text-primary">{b.user?.name || "Customer"}</h4>
                                    <span className="text-[9px] text-ink/60 border border-outline-variant/30 px-1.5 py-0.5">
                                        {b.bookingId}
                                    </span>
                                    <span
                                        className={`text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                                            STATUS_STYLES[b.status] || "bg-surface-container-low text-ink/65"
                                        }`}
                                    >
                                        {b.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/65">
                                    <span className="flex items-center gap-1">
                                        <Users size={12} /> {b.partySize} guests
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Armchair size={12} /> Table {b.table?.tableNumber || "—"} · {b.table?.capacity || "?"} seats
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {formatDateShort(b.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {formatTime12(b.startTime)}
                                    </span>
                                </div>
                                {b.user?.email && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
                                        <span className="flex items-center gap-1">
                                            <Mail size={11} /> {b.user.email}
                                        </span>
                                        {b.user?.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone size={11} /> {b.user.phone}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {b.notes && (
                                    <p className="text-xs text-secondary/80 bg-secondary/5 px-3 py-1.5 rounded-sm border-l-2 border-secondary mt-2">
                                        <strong>Requests:</strong> {b.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                                {b.status === "pending" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateBookingStatus(b._id, "confirmed")}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-medium tracking-wider uppercase transition-colors rounded-sm cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUpdateBookingStatus(b._id, "cancelled")}
                                            className="px-4 py-2 bg-error hover:bg-error/85 text-white text-[9px] font-medium tracking-wider uppercase transition-colors rounded-sm cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {b.status === "confirmed" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateBookingStatus(b._id, "completed")}
                                            className="px-3 py-1.5 bg-primary hover:bg-secondary text-on-secondary text-[9px] font-medium tracking-wider uppercase transition-colors rounded-sm cursor-pointer"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={() => handleUpdateBookingStatus(b._id, "cancelled")}
                                            className="px-3 py-1.5 bg-error hover:bg-error/85 text-white text-[9px] font-medium tracking-wider uppercase transition-colors rounded-sm cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
