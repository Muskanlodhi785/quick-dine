/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star } from "lucide-react";

interface RestaurantHeroProps {
    restaurant: any;
}

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
    if (!restaurant) return null;

    const rating = Number(restaurant.rating) || 0;
    const reviewCount = Number(restaurant.reviews) || 0;

    return (
        <section className="relative h-[480px] w-full overflow-hidden text-left">
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover brightness-[0.7]" />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Hero Overlay Info */}
            <div className="absolute bottom-0 inset-x-0 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-medium tracking-widest text-on-secondary-container bg-secondary py-1 px-3 uppercase">
                                {restaurant.cuisine}
                            </span>
                            {restaurant.exclusive && (
                                <span className="text-[10px] font-medium tracking-widest text-on-primary bg-primary border border-outline-variant/20 py-1 px-3 uppercase">
                                    EXCLUSIVE CLUB
                                </span>
                            )}
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight leading-tight">
                            {restaurant.name}
                        </h1>

                        <div className="flex items-center gap-4 text-ink/90 text-xs">
                            <div className="flex items-center gap-1">
                                <Star size={14} fill="currentColor" className="text-amber-300" />
                                <span className="font-medium text-white">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                            </div>
                            <span>•</span>
                            <span>{reviewCount} Reviews</span>
                            <span>•</span>
                            <span>Price: {restaurant.priceRange}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
