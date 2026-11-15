/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin, Clock, Utensils, ChefHat, Phone } from "lucide-react";
import { formatTime12 } from "../../lib/format.ts";

interface RestaurantInfoProps {
    restaurant: any;
}

export default function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
    if (!restaurant) return null;

    const openingHours = `${formatTime12(restaurant.openingTime || "12:00")} – ${formatTime12(
        restaurant.closingTime || "23:00"
    )}`;

    return (
        <div className="space-y-12 text-left">
            {/* Info Ribbon */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-outline-variant/10">
                <div className="text-center border-r border-outline-variant/10 px-2">
                    <ChefHat className="text-secondary mx-auto mb-2" size={20} />
                    <span className="block text-[9px] tracking-wider text-ink/65 uppercase">CHEF</span>
                    <span className="text-xs text-primary mt-1 block font-medium">{restaurant.chef}</span>
                </div>
                <div className="text-center border-r border-outline-variant/10 px-2">
                    <Utensils className="text-secondary mx-auto mb-2" size={20} />
                    <span className="block text-[9px] tracking-wider text-ink/65 uppercase">CUISINE</span>
                    <span className="text-xs text-primary mt-1 block font-medium">{restaurant.cuisine}</span>
                </div>
                <div className="text-center px-2">
                    <Clock className="text-secondary mx-auto mb-2" size={20} />
                    <span className="block text-[9px] tracking-wider text-ink/65 uppercase">HOURS</span>
                    <span className="text-xs text-primary mt-1 block font-medium">{openingHours}</span>
                </div>
            </div>

            {/* About Section */}
            <section className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-primary">About the Dining Room</h3>
                <p className="text-sm text-ink/65 leading-relaxed">{restaurant.description}</p>
                <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2 text-sm text-ink/65">
                        <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
                        <span>{restaurant.address}</span>
                    </div>
                    {restaurant.phone && (
                        <div className="flex items-center gap-2 text-sm text-ink/65">
                            <Phone size={16} className="text-secondary shrink-0" />
                            <span>{restaurant.phone}</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
