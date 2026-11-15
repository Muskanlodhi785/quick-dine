import toast from "react-hot-toast";

export default function NewsletterCTA() {
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Thank you for joining the Velvet Circle!");
    };

    return (
        <section className="relative overflow-hidden bg-primary text-on-primary text-center py-20 xl:py-28">
            {/* subtle spice accents */}
            <span className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-honey/20 blur-2xl" aria-hidden />
            <span className="pointer-events-none absolute -bottom-14 -right-10 w-48 h-48 rounded-full bg-leaf/25 blur-2xl" aria-hidden />
            <div className="relative max-w-2xl mx-auto px-6">
                <span className="text-honey tracking-[0.35em] text-[10px] font-semibold uppercase">✦ Velvet Circle ✦</span>
                <h2 className="font-display text-3xl md:text-4xl mt-3">
                    Join the Culinary Circle
                </h2>
                <p className="text-sm text-on-primary/80 mt-3 mb-8 leading-relaxed">
                    First access to new openings, family feast nights and seasonal tasting menus.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        className="flex-1 bg-on-primary/10 border border-on-primary/40 focus:border-honey text-on-primary text-sm py-3 px-4 rounded-md outline-none placeholder:text-on-primary/60 transition-colors"
                        placeholder="Email Address"
                        type="email"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-on-primary text-primary hover:bg-leaf hover:text-white transition-soft text-xs tracking-widest uppercase py-3 px-8 rounded-md cursor-pointer"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
}
