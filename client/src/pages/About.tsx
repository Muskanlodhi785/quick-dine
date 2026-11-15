import { Link } from "react-router-dom";
import { Flame, Mountain, Users, ArrowRight } from "lucide-react";

const PILLARS = [
    { icon: Flame, title: "Curated Flavors", text: "From legendary charcoal pits to modern fine dining — we hand-select the region's best culinary masters." },
    { icon: Mountain, title: "Instant Reservations", text: "Real-time table booking with live availability locks — never wait in line again." },
    { icon: Users, title: "Hospitality First", text: "Direct connection between discerning diners and venue owners for flawless service." },
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
                        A seat at every <em className="text-gradient-brand">great table</em>
                    </h1>
                    <p className="text-ink/65 text-sm md:text-base mt-6 leading-relaxed max-w-2xl mx-auto">
                        Velvet Table was born from a simple belief — that finding and reserving extraordinary dining should be effortless. We connect discerning diners with Hyderabad's most iconic culinary destinations, celebrating diverse traditions from heritage clay ovens to modern rooftop grills.
                    </p>
                </header>

                {/* Image band */}
                <div className="max-w-6xl mx-auto px-6 md:px-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60">
                            <img src="/restaurant_3.jpg" alt="Dining ambiance" className="w-full h-full object-cover" />
                        </div>
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60 md:mt-8">
                            <img src="/restaurant_2.jpg" alt="Culinary masterworks" className="w-full h-full object-cover" />
                        </div>
                        <div className="rounded-2xl overflow-hidden h-64 border border-outline-variant/60">
                            <img src="/restaurant_6.png" alt="Velvet Table partner venue" className="w-full h-full object-cover" />
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
                    <p className="text-sm text-ink/60">Discover exceptional tables — reserve instantly online.</p>
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
