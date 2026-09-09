/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star } from "lucide-react";

interface RestaurantReviewsProps {
    restaurant?: any;
}

export default function RestaurantReviews({ restaurant }: RestaurantReviewsProps) {
    const rating = Number(restaurant?.rating) || 0;
    const reviewCount = Number(restaurant?.reviews) || 0;

    return (
        <section className="space-y-6 pt-6 border-t border-outline-variant/10 text-left">
            <h3 className="font-display text-xl font-semibold text-primary">Guest Experiences</h3>

            {/* Rating summary from live data */}
            <div className="bg-surface-container-low/40 border border-outline-variant/10 rounded-md p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                    <span className="font-display text-4xl font-medium text-primary">
                        {rating > 0 ? rating.toFixed(1) : "—"}
                    </span>
                    <div className="space-y-1">
                        <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round(rating) ? "currentColor" : "none"} className={i < Math.round(rating) ? "" : "text-ink/30"} />
                            ))}
                        </div>
                        <p className="text-xs text-ink/65">{reviewCount} verified reviews</p>
                    </div>
                </div>
                <p className="text-xs text-ink/65 leading-relaxed max-w-md">
                    Ratings are collected from completed bookings. Leave the restaurant your feedback after your visit to help future diners.
                </p>
            </div>
        </section>
    );
}
