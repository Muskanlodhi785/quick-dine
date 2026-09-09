/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, MapPin, Armchair, Check, Hourglass } from "lucide-react";
import { formatDateLong, formatTime12 } from "../../lib/format.ts";

interface BookingSuccessProps {
    confirmedBooking: any;
    restaurant: any;
    date: string;
    slot: string;
    guests: string;
    tableLabel?: string;
}

export default function BookingSuccess({
    confirmedBooking,
    restaurant,
    date,
    slot,
    guests,
    tableLabel,
}: BookingSuccessProps) {
    if (!confirmedBooking || !restaurant) return null;

    const isPending = confirmedBooking.status === "pending";

    return (
        <div className="max-w-xl w-full bg-raised border border-outline-variant/20 p-10 text-center rounded-lg shadow-sm space-y-8">
            <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isPending ? "bg-amber-400/15 text-amber-300" : "bg-secondary/15 text-secondary"
                }`}
            >
                {isPending ? <Hourglass size={30} /> : <Check size={32} />}
            </div>

            <div className="space-y-3">
                <h2 className="font-display text-3xl font-medium text-primary">
                    {isPending ? "Reservation Request Sent" : "Reservation Confirmed"}
                </h2>
                <p className="text-xs text-ink/65 max-w-sm mx-auto leading-relaxed">
                    {isPending ? (
                        <>
                            Your table request at <span className="text-primary">{restaurant.name}</span> is with the
                            restaurant. You will see it as <strong>pending</strong> until they confirm - track it in My
                            Bookings.
                        </>
                    ) : (
                        <>
                            A curated dining experience has been successfully reserved for you at{" "}
                            <span className="text-primary">{restaurant.name}</span>.
                        </>
                    )}
                </p>
            </div>

            {/* Confirmation Card Details */}
            <div className="bg-surface-container-low p-6 rounded-md space-y-4 text-left border border-outline-variant/10">
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                    <span className="text-[10px] font-medium text-ink/65 tracking-wider uppercase">REFERENCE CODE</span>
                    <span className="text-sm font-medium text-secondary">{confirmedBooking.bookingId}</span>
                </div>

                <div className="space-y-3 text-xs text-on-surface">
                    <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-ink/65" />
                        <span>{formatDateLong(date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock size={14} className="text-ink/65" />
                        <span>{formatTime12(slot)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users size={14} className="text-ink/65" />
                        <span>
                            {guests} {guests === "1" ? "Guest" : "Guests"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Armchair size={14} className="text-ink/65" />
                        <span>{confirmedBooking.table?.tableNumber || tableLabel || "Assigned table"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-ink/65 mt-0.5" />
                        <span>{restaurant.address}</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                    to="/dashboard"
                    className="flex-1 bg-primary hover:bg-secondary text-on-secondary py-3.5 px-4 text-xs font-medium tracking-widest uppercase text-center cursor-pointer transition-colors"
                >
                    MY BOOKINGS
                </Link>
                <Link
                    to="/"
                    className="flex-1 border border-outline-variant/50 hover:border-primary text-primary py-3.5 px-4 text-xs font-medium tracking-widest uppercase text-center cursor-pointer transition-colors"
                >
                    DISCOVER MORE
                </Link>
            </div>
        </div>
    );
}
