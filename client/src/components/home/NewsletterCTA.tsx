import toast from "react-hot-toast";

export default function NewsletterCTA() {
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Thank you for joining the Culinary Inner Circle!");
    };

    return (
        <section className="relative overflow-hidden bg-linear-to-r from-primary-container via-secondary to-primary-container text-center py-20 xl:py-28">
            <div className="max-w-2xl mx-auto px-6">
                <h2 className="font-display text-3xl md:text-4xl text-on-primary mb-4">
                    Join the Culinary Inner Circle
                </h2>
                <p className="text-sm text-on-primary/80 mb-8 leading-relaxed">
                    Subscribe to receive first access to new openings and seasonal tasting menus.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        className="flex-1 bg-on-primary/15 border-b border-on-primary/40 focus:border-on-primary text-on-primary text-sm py-3 px-4 rounded-md outline-none placeholder:text-on-primary/60"
                        placeholder="Email Address"
                        type="email"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-on-primary text-primary hover:bg-black hover:text-white transition-soft text-xs tracking-widest uppercase py-3 px-8 rounded-md cursor-pointer"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
}
