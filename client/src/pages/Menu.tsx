import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import { Flame, ArrowRight } from "lucide-react";

interface MenuItem {
    name: string;
    desc: string;
    price: string;
    tag?: string;
}

interface MenuSection {
    title: string;
    note: string;
    items: MenuItem[];
}

const SECTIONS: MenuSection[] = [
    {
        title: "From the Fire",
        note: "Everything below is cooked over live charcoal — the Brohi way.",
        items: [
            { name: "Brohi Chicken Gola Kabab", desc: "Hand-pounded chicken seekh, smoked over embers", price: "Rs. 750", tag: "Signature" },
            { name: "Malai Boti", desc: "Cream-marinated thigh, saffron & green chilli", price: "Rs. 950" },
            { name: "Chicken Angara", desc: "Fiery charcoal finish, ghee-laced masala", price: "Rs. 1,150" },
            { name: "Fish Angara", desc: "Whole river fish, charred skin, tamarind glaze", price: "Rs. 1,400" },
        ],
    },
    {
        title: "Karahi & Dampukht",
        note: "Sealed and slow-cooked, opened at your table.",
        items: [
            { name: "Mutton Karahi", desc: "Tomato-forward karahi, bone marrow, fresh coriander", price: "Rs. 2,400", tag: "House Special" },
            { name: "Chicken Karahi", desc: "Desi chicken, cracked pepper, ghee", price: "Rs. 1,450" },
            { name: "Mutton Dampukht", desc: "Overnight-sealed clay pot, tender to the bone", price: "Rs. 2,900", tag: "Chef's Pick" },
            { name: "Daal Makhni", desc: "48-hour black lentils, slow cream, smoked butter", price: "Rs. 650" },
        ],
    },
    {
        title: "From the Tandoor",
        note: "Baked on the walls of our clay oven.",
        items: [
            { name: "Naan / Chapati", desc: "Straight from the tandoor, brushed with white butter", price: "Rs. 60–80" },
            { name: "Garlic Cheese Naan", desc: "Hand-stretched, molten mozzarella, roasted garlic", price: "Rs. 250" },
            { name: "Roghni Naan", desc: "Sesame-crusted, saffron sheen", price: "Rs. 180" },
        ],
    },
];

export default function Menu() {
    return (
        <div className="min-h-screen bg-surface flex flex-col">
            <Navbar />

            <main className="grow">
                <div className="ajrak-strip"></div>
                <header className="text-center pt-24 md:pt-32 pb-12 px-6">
                    <p className="text-[11px] font-bold tracking-[0.34em] uppercase text-secondary">Est. Hyderabad</p>
                    <h1 className="font-display text-4xl md:text-6xl text-primary mt-4">
                        Our <em className="text-gradient-brand">Menu</em>
                    </h1>
                    <p className="text-ink/60 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                        Family recipes from the Baloch mountains — fire, clay, smoke and very little else.
                    </p>
                </header>

                <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20 space-y-14">
                    {SECTIONS.map((section) => (
                        <section key={section.title}>
                            <div className="flex items-end justify-between gap-4 border-b border-outline-variant/60 pb-3 mb-2">
                                <div>
                                    <h2 className="font-display text-2xl md:text-3xl text-primary">{section.title}</h2>
                                    <p className="text-xs text-ink/55 mt-1">{section.note}</p>
                                </div>
                                <Flame className="text-terracotta shrink-0 mb-1" size={20} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-x-10">
                                {section.items.map((item) => (
                                    <div
                                        key={item.name}
                                        className="py-4 flex items-start justify-between gap-6 border-b border-dashed border-outline-variant/60"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-primary">{item.name}</h3>
                                                {item.tag && (
                                                    <span className="text-[9px] font-bold tracking-widest uppercase text-on-primary-container bg-primary-container px-1.5 py-0.5 rounded-sm">
                                                        {item.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-ink/55 mt-1">{item.desc}</p>
                                        </div>
                                        <span className="text-sm font-bold text-secondary whitespace-nowrap">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* CTA */}
                    <div className="bg-primary-container text-on-primary-container rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div>
                            <h2 className="font-display text-2xl md:text-3xl">Hungry already?</h2>
                            <p className="text-sm text-on-primary-container/85 mt-1">
                                Reserve a table and let the smoke do the talking.
                            </p>
                        </div>
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 bg-on-primary text-primary px-7 py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-ink hover:text-on-primary transition-colors"
                        >
                            Book a Table <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
