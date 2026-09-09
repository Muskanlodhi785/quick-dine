const ITEMS = [
    "Live Charcoal BBQ",
    "Mutton Dampukht",
    "Gola Kabab",
    "Karahi",
    "Sindhi Haleem",
    "Malai Boti",
    "Fresh Naan from the Tandoor",
    "Dastarkhwan Family Seating",
];

export default function MarqueeStrip() {
    const row = [...ITEMS, ...ITEMS];
    return (
        <div className="relative py-3 bg-primary-container/90 text-on-primary-container overflow-hidden marquee-mask select-none">
            <div className="animate-marquee flex whitespace-nowrap items-center">
                {row.map((item, i) => (
                    <span key={i} className="inline-flex items-center text-[11px] font-semibold tracking-[0.22em] uppercase">
                        <span className="px-5">{item}</span>
                        <span aria-hidden className="text-on-primary-container/60">✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
