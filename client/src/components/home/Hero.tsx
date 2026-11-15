import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, ArrowRight, Flame } from "lucide-react";

const GUEST_OPTIONS = [1, 2, 4, 6, 8];
const SIGNATURES = ["Mutton Dampukht", "Charcoal Karahi", "Malai Boti", "Angara Fish"];

export default function Hero() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");

    const [guests, setGuests] = useState("2");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (location) params.append("location", location);
        if (guests) params.append("guests", guests);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden">
            {/* Ajrak print strip */}
            <div className="ajrak-strip"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                {/* Copy */}
                <div className="text-left">
                    <div className="flex items-center gap-3 fade-up">
                        <Flame size={16} className="text-terracotta" />
                        <p className="text-[11px] md:text-xs font-bold tracking-[0.3em] uppercase text-secondary">
                            Premier Dining Platform · Instant Booking
                        </p>
                    </div>

                    <h1 className="font-display text-[2.6rem] leading-[1.05] sm:text-6xl xl:text-[4.2rem] text-primary mt-5 tracking-tight fade-up" style={{ animationDelay: "0.06s" }}>
                        Every table.
                        <br />
                        <em className="text-gradient-brand not-italic font-semibold">In real time.</em>
                    </h1>

                    <p className="text-ink/80 text-base md:text-lg mt-6 max-w-md leading-relaxed fade-up" style={{ animationDelay: "0.12s" }}>
                        Velvet Table connects you with the region's finest restaurants — from slow-fire Balochi charcoal and Sindhi dastarkhwans to modern rooftop grills, book your table in seconds.
                    </p>

                    {/* Signature chips */}
                    <div className="flex flex-wrap gap-2 mt-6 fade-up" style={{ animationDelay: "0.18s" }}>
                        {SIGNATURES.map((dish) => (
                            <Link
                                key={dish}
                                to="/menu"
                                className="text-[11px] font-semibold tracking-wider uppercase border border-outline-variant/80 bg-raised px-3 py-1.5 rounded-full text-ink/70 hover:border-secondary hover:text-secondary transition-colors"
                            >
                                {dish}
                            </Link>
                        ))}
                        <Link
                            to="/menu"
                            className="text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary transition-colors inline-flex items-center gap-1"
                        >
                            Full menu <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* Search bar */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="bg-raised border border-outline-variant/70 ambient-shadow rounded-2xl p-3 md:p-2.5 mt-9 max-w-xl flex flex-col md:flex-row gap-2 fade-up"
                        style={{ animationDelay: "0.26s" }}
                    >
                        <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-outline-variant/60 px-3 py-3">
                            <Search className="text-secondary mr-2.5 shrink-0" size={17} />
                            <input
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-ink placeholder:text-ink/40"
                                placeholder="Cuisine or dish"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-outline-variant/60 px-3 py-3">
                            <MapPin className="text-secondary mr-2.5 shrink-0" size={17} />
                            <input
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-ink placeholder:text-ink/40"
                                placeholder="City or area"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 flex items-center px-3 py-3">
                            <Users className="text-secondary mr-2.5 shrink-0" size={17} />
                            <select
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-ink cursor-pointer"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                            >
                                {GUEST_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? "Guest" : "Guests"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 bg-primary text-on-primary text-xs font-bold tracking-[0.16em] uppercase px-6 py-3.5 rounded-xl hover:bg-secondary hover:text-on-secondary transition-all duration-300 cursor-pointer"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Visual panel */}
                <div className="relative fade-up" style={{ animationDelay: "0.2s" }}>
                    <div className="absolute -top-8 -right-6 w-44 h-44 bg-primary-container/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="relative rounded-t-[999px] rounded-b-3xl overflow-hidden border-[6px] border-raised shadow-2xl shadow-black/20 mx-auto max-w-md">
                        <img
                            src="/restaurant_1.png"
                            alt="Curated restaurant dining on Velvet Table"
                            className="w-full h-[430px] object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/25 to-transparent p-6 text-left">
                            <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-amber-300">House Special</p>
                            <p className="font-display text-2xl text-cream mt-1">Mutton Dampukht</p>
                        </div>
                    </div>

                    {/* Floating card */}
                    <div className="absolute -bottom-5 -left-4 md:-left-8 bg-raised border border-outline-variant/70 ambient-shadow rounded-xl px-5 py-4 flex items-center gap-4">
                        <span className="size-11 rounded-full bg-primary-container/12 flex items-center justify-center text-secondary">
                            <Calendar size={20} />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-primary">Open till 1 AM</p>
                            <p className="text-[11px] text-ink/55">Dinner · 6 PM – 1 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
