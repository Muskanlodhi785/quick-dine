/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Users, Armchair } from "lucide-react";
import { todayISO } from "../../lib/format.ts";

interface BookingWidgetProps {
    restaurant: any;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedGuests: string;
    setSelectedGuests: (guests: string) => void;
    selectedSlot: string;
    selectSlot: (slot: string) => void;
    selectedTableId: string;
    setSelectedTableId: (tableId: string) => void;
    slotsAvailability: any[];
    loadingSlots: boolean;
    isAuthenticated: boolean;
    handleReserveClick: () => void;
}

export default function BookingWidget({
    restaurant,
    selectedDate,
    setSelectedDate,
    selectedGuests,
    setSelectedGuests,
    selectedSlot,
    selectSlot,
    selectedTableId,
    setSelectedTableId,
    slotsAvailability,
    loadingSlots,
    isAuthenticated,
    handleReserveClick,
}: BookingWidgetProps) {
    if (!restaurant) return null;

    const selectedSlotInfo = slotsAvailability.find((s: any) => s.time === selectedSlot);

    return (
        <div className="bg-raised border border-outline-variant/20 p-6 rounded-md shadow-sm text-left">
            <h3 className="font-display text-lg font-medium text-primary mb-4 pb-3 border-b border-outline-variant/10">
                Book a Table
            </h3>

            <div className="space-y-4">
                {/* Party size */}
                <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">PARTY SIZE</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-3 text-ink/65" size={16} />
                        <select
                            value={selectedGuests}
                            onChange={(e) => {
                                setSelectedGuests(e.target.value);
                                setSelectedTableId("");
                            }}
                            className="w-full bg-surface-container-low/30 pl-9 pr-3 py-2.5 text-xs border border-outline-variant/40 focus:border-secondary focus:outline-none rounded-md cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                <option key={n} value={n}>
                                    {n} {n === 1 ? "Guest" : "Guests"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">DATE</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-ink/65" size={16} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedTableId("");
                            }}
                            min={todayISO()}
                            className="w-full bg-surface-container-low/30 pl-9 pr-3 py-2.5 text-xs border border-outline-variant/40 focus:border-secondary focus:outline-none rounded-md cursor-pointer"
                        />
                    </div>
                </div>

                {/* Time slots */}
                <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">AVAILABLE TIMES</span>
                    {loadingSlots ? (
                        <div className="py-4 text-center flex justify-center">
                            <div className="w-5 h-5 border-2 border-outline-variant/30 border-t-secondary rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {slotsAvailability.map((slotInfo: any) => {
                                const isToday = selectedDate === todayISO();
                                if (isToday) {
                                    const [slotHour, slotMinute] = slotInfo.time.split(":").map(Number);
                                    const now = new Date();
                                    const past =
                                        slotHour < now.getHours() ||
                                        (slotHour === now.getHours() && slotMinute <= now.getMinutes());
                                    if (past) return null;
                                }
                                const isSelected = selectedSlot === slotInfo.time;
                                const isFull = !slotInfo.available;
                                return (
                                    <button
                                        key={slotInfo.time}
                                        type="button"
                                        disabled={isFull}
                                        onClick={() => selectSlot(slotInfo.time)}
                                        className={`py-2 px-1 text-center text-[10px] font-medium tracking-wider uppercase border transition-all rounded-sm ${
                                            isSelected
                                                ? "bg-secondary border-secondary text-white shadow-sm cursor-pointer"
                                                : isFull
                                                  ? "bg-black/5 border-outline-variant/10 text-ink/35 cursor-not-allowed opacity-50"
                                                  : "border-outline-variant/40 text-ink/65 hover:border-primary hover:text-primary cursor-pointer"
                                        }`}
                                    >
                                        {slotInfo.time}
                                        {isFull ? (
                                            <span className="block text-[8px] text-error uppercase mt-0.5">Full</span>
                                        ) : (
                                            <span className="block text-[8px] text-secondary uppercase mt-0.5">
                                                {slotInfo.tables?.length ?? 0} table{(slotInfo.tables?.length ?? 0) === 1 ? "" : "s"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Table picker for the chosen slot */}
                {selectedSlotInfo && (
                    <div className="space-y-2 border border-outline-variant/20 rounded-md p-3 bg-surface-container-low/20">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-ink/65 tracking-wider uppercase">
                            <Armchair size={13} /> CHOOSE A TABLE · {selectedSlotInfo.time}
                        </span>
                        {selectedSlotInfo.tables?.length ? (
                            <div className="flex flex-wrap gap-3 pt-1">
                                {selectedSlotInfo.tables.map((t: any) => {
                                    const active = selectedTableId === t._id;
                                    const seats = Array.from({ length: Math.min(t.capacity, 8) });
                                    return (
                                        <button
                                            key={t._id}
                                            type="button"
                                            onClick={() => setSelectedTableId(t._id)}
                                            aria-pressed={active}
                                            className={`group flex flex-col items-center gap-1.5 min-w-[74px] px-3 py-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                                                active
                                                    ? "bg-secondary/10 border-secondary text-secondary step-pulse"
                                                    : "border-outline-variant/50 text-ink/60 hover:border-secondary/70 hover:text-secondary hover:-translate-y-0.5"
                                            }`}
                                        >
                                            {/* mini top-view: seats around the table */}
                                            <span className="flex flex-wrap justify-center gap-[3px] w-14">
                                                {seats.map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`w-[5px] h-[5px] rounded-full transition-colors ${
                                                            active ? "bg-secondary" : "bg-current opacity-60"
                                                        }`}
                                                    />
                                                ))}
                                            </span>
                                            <span className="text-[10px] font-semibold tracking-wide">
                                                {t.tableNumber}
                                            </span>
                                            <span className={`text-[9px] -mt-1 ${active ? "text-secondary/80" : "text-ink/40"}`}>
                                                {t.capacity} {t.capacity === 1 ? "seat" : "seats"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-ink/55 italic">No free tables for this slot.</p>
                        )}
                    </div>
                )}

                {/* Action button */}
                <button
                    onClick={handleReserveClick}
                    className="w-full bg-primary hover:bg-secondary text-on-primary py-4 mt-4 text-xs font-medium tracking-widest uppercase transition-colors cursor-pointer"
                >
                    {isAuthenticated ? "RESERVE THIS TABLE" : "LOGIN TO RESERVE"}
                </button>

                <p className="text-center text-[10px] text-ink/65 mt-3 leading-relaxed">
                    Your request goes straight to the restaurant - each booking shows as pending until the house confirms your table (usually within minutes).
                </p>
            </div>
        </div>
    );
}
