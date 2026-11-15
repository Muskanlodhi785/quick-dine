import { BadgeCheck, Flame } from "lucide-react";

export default function MembershipSection() {
    return (
        <section className="py-24 xl:py-32 bg-raised px-6 md:px-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 h-[450px] overflow-hidden rounded-lg">
                    <img
                        src="/brohi-dastarkhwan.png"
                        alt="Velvet Table dining experiences - exceptional feasts and gatherings"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>
                <div className="lg:col-span-5 flex flex-col justify-center lg:pl-6">
                    <span className="text-[10px] text-secondary tracking-[0.2em] block mb-2 uppercase">✦ THE VELVET CIRCLE</span>
                    <h2 className="font-display text-3xl md:text-4xl text-primary mb-6 leading-tight">
                        Gather your guests, <span className="text-gradient-brand italic">reserve with privilege</span>
                    </h2>
                    <p className="text-sm text-ink/65 mb-8 leading-relaxed">
                        Join the Velvet Circle for priority bookings across partner restaurants — guaranteed prime table holds at peak hours, VIP seating for celebrations, and invitations to exclusive chef tastings.
                    </p>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <BadgeCheck size={20} className="text-secondary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm text-primary">Last-Minute Dastarkhwan Tables</h4>
                                <p className="text-xs text-ink/65 mt-1 leading-relaxed">
                                    Weekend family slots held exclusively for Circle members when the house is full.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Flame size={20} className="text-secondary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm text-primary">Live-Coal Feast Night Invites</h4>
                                <p className="text-xs text-ink/65 mt-1 leading-relaxed">
                                    First call for our Thursday family nights - fresh dampukht, whole-kabab platters and
                                    unlimited tandoor naan, straight off the fire.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
