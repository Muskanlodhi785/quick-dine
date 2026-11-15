import React from "react";

interface BookingFormProps {
    notes: string;
    setNotes: (val: string) => void;
    confirming: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function BookingForm({ notes, setNotes, confirming, onSubmit }: BookingFormProps) {
    return (
        <div className="bg-raised border border-outline-variant/20 p-8 rounded-md shadow-sm text-left">
            <h3 className="font-display text-lg font-semibold text-primary mb-6 pb-3 border-b border-outline-variant/10">
                Confirm Reservation
            </h3>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Special Requests */}
                <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">
                        SPECIAL REQUESTS (OPTIONAL)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        maxLength={500}
                        placeholder="Allergies, dietary restrictions, high chair, window table..."
                        className="w-full bg-surface-container-low/20 border border-outline-variant/40 rounded-md p-3 text-xs focus:border-secondary focus:outline-none"
                    ></textarea>
                </div>

                <p className="text-xs text-ink/65 leading-relaxed bg-secondary/5 border-l-2 border-secondary px-3 py-2.5">
                    The restaurant confirms every request before it becomes a confirmed booking. You will be able to
                    track the status in <strong>My Bookings</strong>.
                </p>

                {/* Confirm Action Button */}
                <button
                    type="submit"
                    disabled={confirming}
                    className="w-full bg-primary hover:bg-secondary text-on-secondary py-4 text-xs font-medium tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-60"
                >
                    {confirming ? "REQUESTING TABLE..." : "REQUEST TABLE"}
                </button>
            </form>
        </div>
    );
}
