/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import RestaurantHero from "../components/restaurant/RestaurantHero.tsx";
import RestaurantInfo from "../components/restaurant/RestaurantInfo.tsx";
import RestaurantReviews from "../components/restaurant/RestaurantReviews.tsx";
import BookingWidget from "../components/restaurant/BookingWidget.tsx";
import api from "../lib/api.ts";
import { todayISO } from "../lib/format.ts";
import { getSocket } from "../lib/socket.ts";

export default function RestaurantDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated, setAuthModalOpen } = useAppContext();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Booking Widget states
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [selectedGuests, setSelectedGuests] = useState("2");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [selectedTableId, setSelectedTableId] = useState("");
    const [slotsAvailability, setSlotsAvailability] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Single restaurant fetch via the dedicated slug endpoint.
    useEffect(() => {
        if (!slug) return;
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
        fetchRestaurant();
    }, [slug, navigate]);

    // Single availability fetch (date + party size aware).
    useEffect(() => {
        if (!restaurant?._id || !selectedDate) return;
        const controller = new AbortController();
        let active = true;

        const loadAvailability = async () => {
            try {
                const res = await api.get(`/restaurant/${restaurant._id}/availability`, {
                    params: { date: selectedDate, partySize: selectedGuests },
                    signal: controller.signal,
                });
                if (active) {
                    setSlotsAvailability(res.data);
                    setLoadingSlots(false);
                }
            } catch (error: any) {
                if (active && error?.code !== "ERR_CANCELED") {
                    toast.error(error?.response?.data?.message || "Could not load availability");
                    setLoadingSlots(false);
                }
            }
        };

        void loadAvailability();

        return () => {
            active = false;
            controller.abort();
        };
    }, [restaurant?._id, selectedDate, selectedGuests]);

    // Live Socket.io updates for table bookings & availability
    useEffect(() => {
        if (!restaurant?._id) return;
        const socket = getSocket();
        socket.emit("join_restaurant", restaurant._id);

        const onAvailabilityUpdated = (data: { restaurantId: string; date: string }) => {
            if (data.restaurantId === restaurant._id && data.date === selectedDate) {
                api.get(`/restaurant/${restaurant._id}/availability`, {
                    params: { date: selectedDate, partySize: selectedGuests },
                })
                    .then((res) => setSlotsAvailability(res.data))
                    .catch(() => {});
            }
        };

        socket.on("availability_updated", onAvailabilityUpdated);

        return () => {
            socket.emit("leave_restaurant", restaurant._id);
            socket.off("availability_updated", onAvailabilityUpdated);
        };
    }, [restaurant?._id, selectedDate, selectedGuests]);

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setSelectedSlot("");
        setSelectedTableId("");
    };

    const handleGuestsChange = (guests: string) => {
        setSelectedGuests(guests);
        setSelectedSlot("");
        setSelectedTableId("");
    };

    const selectSlot = useCallback(
        (slot: string) => {
            setSelectedSlot(slot);
            setSelectedTableId("");
        },
        []
    );

    if (loading) {
        return <Loader text="Loading Restaurant Details..." />;
    }

    if (!restaurant) return null;

    const handleReserveClick = () => {
        if (!selectedSlot) {
            toast.error("Please select a dining time slot.");
            return;
        }
        if (!selectedTableId) {
            toast.error("Please choose an available table for this slot.");
            return;
        }
        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        const table = slotsAvailability
            .find((s: any) => s.time === selectedSlot)
            ?.tables?.find((t: any) => t._id === selectedTableId);

        navigate(
            `/booking/${restaurant.slug}?slot=${encodeURIComponent(selectedSlot)}&date=${encodeURIComponent(selectedDate)}&guests=${selectedGuests}&table=${selectedTableId}&tableLabel=${encodeURIComponent(table?.tableNumber || "")}`
        );
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col pt-20">

            <RestaurantHero restaurant={restaurant} />

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-8 space-y-12">
                        <RestaurantInfo restaurant={restaurant} />
                        <RestaurantReviews restaurant={restaurant} />
                    </div>

                    <div className="lg:col-span-4 lg:sticky lg:top-36">
                        <BookingWidget
                            restaurant={restaurant}
                            selectedDate={selectedDate}
                            setSelectedDate={handleDateChange}
                            selectedGuests={selectedGuests}
                            setSelectedGuests={handleGuestsChange}
                            selectedSlot={selectedSlot}
                            selectSlot={selectSlot}
                            selectedTableId={selectedTableId}
                            setSelectedTableId={setSelectedTableId}
                            slotsAvailability={slotsAvailability}
                            loadingSlots={loadingSlots}
                            isAuthenticated={isAuthenticated}
                            handleReserveClick={handleReserveClick}
                        />
                    </div>
                </div>
            </main>

        </div>
    );
}
