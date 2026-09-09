/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users, ShieldCheck, Utensils, Calendar, Armchair } from "lucide-react";
import { formatDateShort, formatTime12 } from "../../lib/format.ts";

interface AdminStatsProps {
    stats: any;
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-400/15 text-amber-300",
    confirmed: "bg-sky-400/15 text-sky-200",
    completed: "bg-emerald-400/15 text-emerald-200",
    cancelled: "bg-error-container text-on-error-container",
};

export default function AdminStats({ stats }: AdminStatsProps) {
    if (!stats) return null;

    const kpiCards = [
        { title: "Active Diners", value: stats.users?.total ?? stats.totalUsers ?? 0, icon: Users },
        { title: "Partners", value: stats.owners?.total ?? 0, icon: ShieldCheck },
        { title: "Total Venues", value: stats.restaurants?.total ?? 0, icon: Utensils },
        { title: "Bookings", value: stats.bookings?.total ?? 0, icon: Calendar },
    ];

    const latestBookings = Array.isArray(stats.latestBookings) ? stats.latestBookings : [];

    return (
        <div className="space-y-8 text-left">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {kpiCards.map(({ title, value, icon: Icon }) => (
                    <div key={title} className="bg-raised border border-outline-variant/20 p-5 rounded-md shadow-sm space-y-2">
                        <span className="text-[10px] font-medium tracking-wider text-ink/65 uppercase flex items-center gap-1.5">
                            <Icon size={12} className="text-secondary" />
                            {title}
                        </span>
                        <h4 className="font-display text-2xl font-medium text-primary">{value}</h4>
                    </div>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="space-y-4">
                <h3 className="font-display text-lg font-medium text-primary">Recent Bookings Activity</h3>

                {latestBookings.length === 0 ? (
                    <p className="text-xs text-ink/50 italic">No bookings recorded on the platform.</p>
                ) : (
                    <div className="bg-raised border border-outline-variant/20 rounded-md overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/10 text-[10px] tracking-wider text-ink/65 uppercase">
                                    {["Ref Code", "Diner", "Restaurant", "Details", "Status"].map((header) => (
                                        <th key={header} className={`p-4 ${header === "Status" ? "text-right" : ""}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-outline-variant/10">
                                {latestBookings.map((b: any) => (
                                    <tr key={b._id} className="hover:bg-surface/50">
                                        <td className="p-4 text-primary">{b.bookingId}</td>

                                        <td className="p-4">
                                            <div className="text-primary">{b.user?.name || "Customer"}</div>
                                            <div className="text-[10px] text-ink/60">{b.user?.email}</div>
                                        </td>

                                        <td className="p-4 text-primary">{b.restaurant?.name || "Deleted Restaurant"}</td>

                                        <td className="p-4 text-ink/65">
                                            {formatDateShort(b.date)} · {formatTime12(b.startTime)} · {b.partySize} guests
                                            <span className="flex items-center gap-1 mt-0.5 text-[10px]">
                                                <Armchair size={11} /> Table {b.table?.tableNumber || "—"}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right">
                                            <span
                                                className={`inline-block py-0.5 px-2 text-[9px] font-medium tracking-wider uppercase rounded-sm ${
                                                    STATUS_STYLES[b.status] || "bg-surface-container-low text-ink/65"
                                                }`}
                                            >
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
