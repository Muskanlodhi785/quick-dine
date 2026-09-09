import { Link } from "react-router-dom";
import { Flame, Mountain, Users, ArrowRight } from "lucide-react";

const PILLARS = [
    { icon: Flame, title: "Live Charcoal", text: "No gas shortcuts — kababs, karahi and dampukht cook over real ember and clay." },
    { icon: Mountain, title: "Highland Recipes", text: "Dishes born in the mountains of Balochistan, carried to Hyderabad by Brohi families." },
    { icon: Users, title: "Table-side Service", text: "Dampukht opened at your table, karahi finished in front of you — food as theatre." },
];

export default function About() {
    return (
        <div className="min-h-screen bg-surface flex flex-col">

            <main className="grow">
                <div className="ajrak-strip"></div>

                {/* Intro */}
                <header className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 pb-14 text-center">
                    <p className="text-[11px] font-bold tracking-[0.34em] uppercase text-secondary">Our Story</p>
                    <h1 className="font-display text-4xl md:text-6xl text-primary mt-4">
                        Fire is in our <em className="text-gradient-brand">blood</em>
                    </h1>
                    <p className="text-ink/65 text-sm md:text-base mt-6 leading-relaxed max-w-2xl mx-auto">
                        Brohi Restaurant began with a family's dastarkhwan — a charcoal pit, a cast karahi, and
                        recipes passed down through generations of the Brohi highlands. Today, in the heart of
                        Hyderabad, we still cook the same way: slowly, over fire, without shortcuts.
                    </p>
                </header>

                {/* Image band */}
                <div className="max-w-6xl mx-auto px-6 md:px-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60">
                            <img src="/restaurant_3.jpg" alt="Clay oven cooking" className="w-full h-full object-cover" />
                        </div>
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60 md:mt-8">
                            <img src="/restaurant_2.jpg" alt="Charcoal skewers" className="w-full h-full object-cover" />
                        </div>
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60">
                            <img src="/restaurant_6.png" alt="Brohi dining hall" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Pillars */}
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-3 gap-6">
                    {PILLARS.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="bg-raised border border-outline-variant/60 rounded-2xl p-7 text-left card-hover-effect">
                            <span className="size-11 rounded-full bg-primary-container/12 flex items-center justify-center text-secondary">
                                <Icon size={20} />
                            </span>
                            <h3 className="font-display text-xl text-primary mt-4">{title}</h3>
                            <p className="text-sm text-ink/60 mt-2 leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="max-w-4xl mx-auto px-6 md:px-10 pb-20 text-center">
                    <p className="text-sm text-ink/60">Come taste the mountains — now bookable online.</p>
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 mt-5 bg-primary-container text-on-primary-container px-7 py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-secondary hover:text-on-secondary transition-colors"
                    >
                        Explore Restaurants <ArrowRight size={14} />
                    </Link>
                </div>
            </main>

        </div>
    );
}
