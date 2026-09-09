/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, Armchair, Check } from "lucide-react";
import { formatDateLong, formatTime12 } from "../../lib/format.ts";

interface BookingSuccessProps {
    confirmedBooking: any;
    restaurant: any;
    date: string;
    slot: string;
    guests: string;
    tableLabel?: string;
}

const STEPS = ["Requested", "Confirmed", "Seated"];

export default function BookingSuccess({
    confirmedBooking,
    restaurant,
    date,
    slot,
    guests,
    tableLabel,
}: BookingSuccessProps) {
    if (!restaurant) return null;

    const status = confirmedBooking?.status ?? "pending";
    const stepIndex = status === "confirmed" || status === "completed" ? 1 : 0;
    const heading =
        status === "confirmed"
            ? "Table confirmed — see you soon!"
            : status === "completed"
              ? "This visit is complete"
              : "Reservation request sent";

    return (
        <div className="bg-raised border border-outline-variant/10 rounded-md shadow-sm p-8 md:p-10 text-left">
            <div className="text-center">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/15 text-secondary pop-in">
                    <Check size={30} strokeWidth={2.5} />
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mt-5">{heading}</h2>
                <p className="text-xs text-ink/60 mt-2 leading-relaxed">
                    {status === "pending" ? (
                        <>The house will confirm your table shortly — usually within minutes. Track it anytime in your bookings.</>
                    ) : status === "completed" ? (
                        <>Thank you for dining with us — come again soon.</>
                    ) : (
                        <>Your {tableLabel || "table"} is locked in at {restaurant.name}. We look forward to hosting you.</>
                    )}
                </p>
                {confirmedBooking?.bookingId && (
                    <p className="text-[10px] uppercase tracking-[0.25em] text-ink/35 mt-3">
                        Reference · {confirmedBooking.bookingId}
                    </p>
                )}
            </div>

            {/* Status timeline */}
            <div className="flex items-center justify-center gap-0 my-8">
                {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    const current = i === stepIndex;
                    return (
                        <div key={step} className="flex items-center">
                            {i > 0 && (
                                <span
                                    className={`h-px w-10 md:w-16 transition-colors duration-500 ${
                                        done ? "bg-secondary" : "bg-outline-variant/60"
                                    }`}
                                />
                            )}
                            <div className="flex flex-col items-center gap-1.5">
                                <span
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border text-[10px] font-semibold transition-all duration-500 ${
                                        done
                                            ? "bg-secondary border-secondary text-on-secondary"
                                            : "border-outline-variant/70 text-ink/35 bg-surface-container-lowest"
                                    } ${current && status === "pending" ? "step-pulse" : ""}`}
                                >
                                    {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                                </span>
                                <span
                                    className={`text-[9px] uppercase tracking-[0.18em] ${
                                        done ? "text-secondary" : "text-ink/35"
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Booking summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-outline-variant/10 pt-6 text-sm">
                <div className="flex items-start gap-2.5">
                    <Calendar size={15} className="text-secondary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-ink/40">Date</p>
                        <p className="text-ink/85 mt-0.5">{formatDateLong(date)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5">
                    <Clock size={15} className="text-secondary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-ink/40">Arrival</p>
                        <p className="text-ink/85 mt-0.5">{formatTime12(slot)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5">
                    <Users size={15} className="text-secondary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-ink/40">Party</p>
                        <p className="text-ink/85 mt-0.5">
                            {guests} {guests === "1" ? "guest" : "guests"}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5">
                    <Armchair size={15} className="text-secondary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-ink/40">Table</p>
                        <p className="text-ink/85 mt-0.5">
                            {confirmedBooking?.table?.tableNumber || tableLabel || "Assigned on arrival"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-outline-variant/10 mt-6">
                <Link
                    to="/dashboard"
                    className="bg-primary hover:bg-secondary text-on-secondary text-[10px] font-semibold tracking-widest uppercase px-6 py-3 transition-colors"
                >
                    View My Bookings
                </Link>
                <Link
                    to="/search"
                    className="text-[10px] font-semibold tracking-widest uppercase px-4 py-3 text-ink/60 hover:text-secondary transition-colors"
                >
                    Explore More Restaurants
                </Link>
            </div>
        </div>
    );
}
