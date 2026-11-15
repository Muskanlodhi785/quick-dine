import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail, ArrowRight } from "lucide-react";

const DETAILS = [
    { icon: MapPin, label: "Headquarters", value: "Auto Bhan Road, Latifabad, Hyderabad, Sindh" },
    { icon: Phone, label: "Concierge & Support", value: "+92 300 1234567 (10 AM – 11 PM)" },
    { icon: Mail, label: "Partner & Inquiries", value: "hello@velvettable.pk" },
    { icon: Clock, label: "Platform Availability", value: "24/7 Real-Time Online Booking" },
];

export default function Contact() {
    return (
        <div className="min-h-screen bg-surface flex flex-col">

            <main className="grow">
                <div className="ajrak-strip"></div>

                <header className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 pb-12 text-center">
                    <p className="text-[11px] font-bold tracking-[0.34em] uppercase text-secondary">Visit Us</p>
                    <h1 className="font-display text-4xl md:text-6xl text-primary mt-4">
                        Find us in <em className="text-gradient-brand">Hyderabad</em>
                    </h1>
                    <p className="text-ink/60 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                        Walk in, or book ahead to keep your table by the fire.
                    </p>
                </header>

                <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20 grid md:grid-cols-2 gap-8">
                    {/* Contact cards */}
                    <div className="space-y-4">
                        {DETAILS.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="bg-raised border border-outline-variant/60 rounded-xl p-5 flex items-start gap-4 text-left"
                            >
                                <span className="size-10 shrink-0 rounded-full bg-primary-container/12 flex items-center justify-center text-secondary">
                                    <Icon size={18} />
                                </span>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-ink/50">{label}</p>
                                    <p className="text-sm font-semibold text-primary mt-1">{value}</p>
                                </div>
                            </div>
                        ))}

                        <a
                            href="https://www.google.com/maps/search/?api=1&query=Latifabad+Hyderabad+Sindh"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-secondary hover:text-primary transition-colors"
                        >
                            Open in Google Maps <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* Private dining / big party CTA */}
                    <div className="bg-primary-container text-on-primary-container rounded-2xl p-8 md:p-10 flex flex-col justify-between">
                        <div>
                            <h2 className="font-display text-2xl md:text-3xl">Big family? Private dastarkhwan?</h2>
                            <p className="text-sm text-on-primary-container/85 mt-3 leading-relaxed">
                                We seat groups of 10–60 for walima, mehndi and office dinners. Send us your date and
                                party size and our team will arrange seating, set menus and the dampukht count.
                            </p>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/search"
                                className="inline-flex items-center gap-2 bg-on-primary text-primary px-6 py-3 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-ink hover:text-on-primary transition-colors"
                            >
                                Book a Table <ArrowRight size={14} />
                            </Link>
                            <a
                                href="tel:+923001234567"
                                className="inline-flex items-center gap-2 border border-on-primary/40 px-6 py-3 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-on-primary/10 transition-colors"
                            >
                                <Phone size={13} /> Call Us
                            </a>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
