/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import Loader from "../../components/Loader.tsx";
import { CalendarIcon, SettingsIcon, Armchair } from "lucide-react";
import RestaurantWizard from "../../components/owner/RestaurantWizard.tsx";
import PendingApproval from "../../components/owner/PendingApproval.tsx";
import RequestRejected from "../../components/owner/RequestRejected.tsx";
import OwnerBookings from "../../components/owner/OwnerBookings.tsx";
import OwnerTables from "../../components/owner/OwnerTables.tsx";
import OwnerProfileDetails from "../../components/owner/OwnerProfileDetails.tsx";
import api from "../../lib/api.ts";
import toast from "react-hot-toast";
import { getSocket } from "../../lib/socket.ts";

export default function OwnerDashboard() {
    const { logout } = useAppContext();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"bookings" | "tables" | "details">("bookings");

    const fetchOwnerData = useCallback(async () => {
        try {
            const res = await api.get("/owner/restaurants");
            setRestaurant(res.data);
            if (res.data && res.data.status === "approved") {
                const [bookingsRes, tablesRes] = await Promise.all([
                    api.get("/owner/bookings"),
                    api.get("/owner/tables"),
                ]);
                setBookings(bookingsRes.data);
                setTables(tablesRes.data);
            }
        } catch (error: any) {
            // 404 with "No restaurant yet" is expected on first login as owner.
            const message = error?.response?.data?.message || error.message;
            if (error?.response?.status !== 404) {
                toast.error(message);
            }
            setRestaurant(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const run = async () => {
            try {
                const res = await api.get("/owner/restaurants");
                if (!active) return;
                setRestaurant(res.data);
                if (res.data && res.data.status === "approved") {
                    const [bookingsRes, tablesRes] = await Promise.all([
                        api.get("/owner/bookings"),
                        api.get("/owner/tables"),
                    ]);
                    if (!active) return;
                    setBookings(bookingsRes.data);
                    setTables(tablesRes.data);
                }
            } catch (error: any) {
                if (!active) return;
                const message = error?.response?.data?.message || error.message;
                if (error?.response?.status !== 404) {
                    toast.error(message);
                }
                setRestaurant(null);
            } finally {
                if (active) setLoading(false);
            }
        };
        void run();
        return () => { active = false; };
    }, []);

    // Socket.io real-time updates for bookings & tables
    useEffect(() => {
        if (!restaurant?._id) return;
        const socket = getSocket();
        socket.emit("join_restaurant", restaurant._id);

        const onBookingCreated = (booking: any) => {
            toast.success(`New reservation received for Table ${booking.table?.tableNumber || ""}`);
            api.get("/owner/bookings").then((res) => setBookings(res.data)).catch(() => {});
        };

        const onBookingUpdated = () => {
            api.get("/owner/bookings").then((res) => setBookings(res.data)).catch(() => {});
        };

        socket.on("booking_created", onBookingCreated);
        socket.on("booking_updated", onBookingUpdated);
        socket.on("booking_cancelled", onBookingUpdated);

        return () => {
            socket.emit("leave_restaurant", restaurant._id);
            socket.off("booking_created", onBookingCreated);
            socket.off("booking_updated", onBookingUpdated);
            socket.off("booking_cancelled", onBookingUpdated);
        };
    }, [restaurant?._id]);

    // Keep the panel fresh if the admin approves the listing while this tab is open.
    useEffect(() => {
        const onFocus = () => {
            if (document.visibilityState === "visible") void fetchOwnerData();
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onFocus);
        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onFocus);
        };
    }, [fetchOwnerData]);

    // Poll for new bookings/tables while the tab is visible (live demo feel).
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") void fetchOwnerData();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchOwnerData]);

    if (loading) {
        return <Loader text="Loading Owner Dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col pt-20">

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
                {/* Heading */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10 pb-8 mb-8">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl text-primary">Restaurant Portal</h1>
                        <p className="text-xs text-ink/65 mt-1.5">
                            Manage your tables, review reservation requests and keep your profile fresh.
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-error-container hover:bg-error-container/85 text-error px-4 py-2 text-[10px] font-medium tracking-widest uppercase transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Case 1: No restaurant yet */}
                {!restaurant ? (
                    <RestaurantWizard
                        setRestaurant={(r: any) => {
                            setRestaurant(r);
                            void fetchOwnerData();
                        }}
                    />
                ) : restaurant.status === "pending" ? (
                    <PendingApproval restaurant={restaurant} />
                ) : restaurant.status === "rejected" ? (
                    <RequestRejected restaurantName={restaurant.name} />
                ) : (
                    /* Approved - full dashboard */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Sidebar */}
                        <aside className="lg:col-span-3 space-y-6 bg-raised border border-outline-variant/20 p-6 rounded-md shadow-sm h-fit">
                            <div className="flex items-center gap-3.5 border-b border-outline-variant/10 pb-5">
                                <span className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-base">
                                    {(restaurant.name || "R").charAt(0)}
                                </span>
                                <div>
                                    <h4 className="font-display font-medium text-primary text-base line-clamp-1">{restaurant.name}</h4>
                                    <span className="text-[9px] text-secondary tracking-widest uppercase bg-secondary-container/20 px-2 py-0.5 rounded-sm inline-block mt-0.5">
                                        APPROVED
                                    </span>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-1.5">
                                <button
                                    onClick={() => setActiveTab("bookings")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium tracking-wider uppercase text-left rounded-sm cursor-pointer transition-colors ${
                                        activeTab === "bookings" ? "bg-primary text-on-primary" : "text-ink/65 hover:bg-surface"
                                    }`}
                                >
                                    <CalendarIcon size={14} />
                                    Bookings ({bookings.filter((b) => b.status === "pending").length} new)
                                </button>
                                <button
                                    onClick={() => setActiveTab("tables")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium tracking-wider uppercase text-left rounded-sm cursor-pointer transition-colors ${
                                        activeTab === "tables" ? "bg-primary text-on-primary" : "text-ink/65 hover:bg-surface"
                                    }`}
                                >
                                    <Armchair size={14} />
                                    Tables ({tables.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium tracking-wider uppercase text-left rounded-sm cursor-pointer transition-colors ${
                                        activeTab === "details" ? "bg-primary text-on-primary" : "text-ink/65 hover:bg-surface"
                                    }`}
                                >
                                    <SettingsIcon size={14} />
                                    Profile Details
                                </button>
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-9 space-y-8">
                            {activeTab === "bookings" && <OwnerBookings bookings={bookings} setBookings={setBookings} />}
                            {activeTab === "tables" && <OwnerTables tables={tables} setTables={setTables} />}
                            {activeTab === "details" && (
                                <OwnerProfileDetails
                                    restaurant={restaurant}
                                    setRestaurant={setRestaurant}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>

        </div>
    );
}
