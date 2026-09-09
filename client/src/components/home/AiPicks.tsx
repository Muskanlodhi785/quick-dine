/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Sparkles, RefreshCcw } from "lucide-react";
import api from "../../lib/api.ts";
import RestaurantCard from "../RestaurantCard.tsx";

const PARTY_OPTIONS = ["2", "4", "6", "8"];
const VIBES: Array<{ label: string; query: string }> = [
    { label: "Any vibe", query: "" },
    { label: "Family BBQ", query: "family bbq" },
    { label: "Karahi night", query: "karahi dampukht" },
    { label: "Seafood", query: "seafood river fish" },
    { label: "Sweet tooth", query: "chai sweets dessert" },
];

export default function AiPicks() {
    const [party, setParty] = useState("4");
    const [vibe, setVibe] = useState(0);
    const [picks, setPicks] = useState<any[]>([]);
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const params: any = { partySize: party, limit: 3 };
            if (VIBES[vibe].query) params.preference = VIBES[vibe].query;
            const response = await api.get("/restaurant/recommend", { params });
            const items = response.data?.recommendations;
            setSource(response.data?.source || "");
            setPicks(Array.isArray(items) ? items : []);
        } catch {
            setPicks([]);
            setSource("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [party, vibe]);

    return (
        <section className="bg-surface px-6 md:px-10 py-16 xl:py-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                    <div>
                        <span className="text-[10px] text-secondary tracking-[0.2em] uppercase flex items-center gap-1.5">
                            <Sparkles size={12} /> Ask Brohi AI
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl text-primary mt-2">
                            Gemini picks for <span className="text-gradient-brand italic">tonight</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden md:block text-[9px] uppercase tracking-[0.2em] text-ink/45 mr-1">Party</span>
                        {PARTY_OPTIONS.map((p) => (
                            <button
                                key={p}
                                type="button" onClick={() => setParty(p)}
                                className={`text-[10px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                                    party === p
                                        ? "bg-primary text-on-primary border-primary"
                                        : "border-outline-variant/60 text-ink/60 hover:border-primary hover:text-primary"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {VIBES.map((v, i) => (
                        <button
                            key={v.label}
                            type="button" onClick={() => setVibe(i)}
                            className={`text-[10px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                                vibe === i
                                    ? "bg-secondary text-on-secondary border-secondary"
                                    : "border-outline-variant/60 text-ink/60 hover:border-secondary hover:text-secondary"
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-96 bg-surface-container-low rounded-md animate-pulse" />
                        ))}
                    </div>
                ) : picks.length ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {picks.map((r) => (
                                <RestaurantCard key={r._id} restaurant={r} reason={r.reason} />
                            ))}
                        </div>
                        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                            <p className="text-[10px] text-ink/50 uppercase tracking-[0.18em]">
                                {source === "ai" ? (
                                    <span className="text-secondary font-semibold">✦ Curated live by Google Gemini</span>
                                ) : (
                                    <span className="text-ink/50">
                                        Gemini is busy right now - showing our top-rated venues instead.
                                    </span>
                                )}
                            </p>
                            <button
                                type="button" onClick={() => void load()}
                                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/55 hover:text-secondary transition-colors cursor-pointer"
                            >
                                <RefreshCcw size={12} /> Re-run
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-ink/60 bg-surface-container-low px-4 py-6 rounded-md">
                        No venues match that mood yet - try another vibe.
                    </p>
                )}
            </div>
        </section>
    );
}
