/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import BookingSuccess from "../components/booking/BookingSuccess.tsx";
import BookingSummary from "../components/booking/BookingSummary.tsx";
import BookingForm from "../components/booking/BookingForm.tsx";
import api from "../lib/api.ts";

export default function BookingConfirmation() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
    const [notes, setNotes] = useState("");

    // From Query Params
    const slot = searchParams.get("slot") || "";
    const date = searchParams.get("date") || "";
    const guests = searchParams.get("guests") || "2";
    const tableId = searchParams.get("table") || "";
    const tableLabel = searchParams.get("tableLabel") || "";

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/restaurant/${slug}`);
                setRestaurant(res.data);
            } catch (error: any) {
                toast.error(error?.response?.data?.error || error?.response?.data?.message || "Restaurant not found");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchRestaurant();
        }
    }, [slug, navigate]);

    if (loading) {
        return <Loader text="Retrieving Dining Details..." />;
    }

    if (!restaurant) return null;

    const handleConfirmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!slot || !date || !tableId) {
            toast.error("Reservation details are missing. Return to the restaurant page and pick a table.");
            navigate(`/restaurant/${slug}`);
            return;
        }

        try {
            setConfirming(true);
            const res = await api.post("/booking", {
                restaurantId: restaurant._id,
                tableId,
                date,
                startTime: slot,
                partySize: Number(guests),
                notes: notes || undefined,
            });
            setConfirmedBooking(res.data);
            toast.success("Reservation request sent to the restaurant!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not create the booking. Please try again.");
        } finally {
            setConfirming(false);
        }
    };

    // Render Success Screen
    if (confirmedBooking) {
        return (
            <div className="min-h-screen bg-surface flex flex-col pt-20">
                <Navbar />
                <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-16 flex items-start justify-center">
                    <BookingSuccess
                        confirmedBooking={confirmedBooking}
                        restaurant={restaurant}
                        date={date}
                        slot={slot}
                        guests={guests}
                        tableLabel={tableLabel}
                    />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col pt-20">
            <Navbar />

            <main className="grow max-w-5xl w-full mx-auto px-6 md:px-10 py-12">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-ink/65 mb-8">
                    <Link to="/" className="hover:text-secondary transition-colors">
                        Home
                    </Link>
                    <ChevronRight size={12} />
                    <Link to={`/restaurant/${restaurant.slug}`} className="hover:text-secondary transition-colors">
                        {restaurant.name}
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-primary">Reserve</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    <div className="lg:col-span-2">
                        <BookingSummary
                            restaurant={restaurant}
                            date={date}
                            slot={slot}
                            guests={guests}
                            tableLabel={tableLabel}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <BookingForm notes={notes} setNotes={setNotes} confirming={confirming} onSubmit={handleConfirmSubmit} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
