import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/User.js";
import { Restaurant } from "./models/Restaurant.js";
import { Table } from "./models/Table.js";
import { Booking } from "./models/Booking.js";
import { BookingLock } from "./models/BookingLock.js";
import { addMinutes, MEAL_DURATION_MIN, todayLocalISO } from "./utils/bookings.js";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface SeedRestaurant {
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  rating: number;
  reviews: number;
  location: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  image: string;
  chef: string;
  tags: string[];
  availableSlots: string[];
  featured: boolean;
  exclusive: boolean;
}

// Velvet Table platform seed data — 16 curated restaurants across Hyderabad & Sindh
const restaurantData: SeedRestaurant[] = [
  {
    name: "Brohi Restaurant",
    slug: "brohi-restaurant",
    description:
      "Balochi charcoal cooking in the heart of Hyderabad. Mutton dampukht sealed overnight, chicken gola kabab over live embers, karahi finished at your table — recipes carried down from the Brohi highlands and served the slow, smoky way.",
    cuisine: "BBQ & Balochi",
    priceRange: "$$",
    rating: 4.8,
    reviews: 412,
    location: "Hyderabad, Sindh",
    address: "Auto Bhan Road, Latifabad, Hyderabad",
    phone: "+92 22 3812345",
    openingTime: "12:00",
    closingTime: "23:30",
    image: "/restaurant_1.png",
    chef: "Sohail Brohi",
    tags: ["Charcoal BBQ", "Dampukht", "Karahi", "Family Dastarkhwan"],
    availableSlots: ["12:00", "13:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: true,
    exclusive: true,
  },
  {
    name: "Sindh Dastarkhwan",
    slug: "sindh-dastarkhwan",
    description:
      "A grand Sindhi dastarkhwan experience in Qasimabad — Hyderabadi haleem, sindhi biryani, koki and seasonal saag, served low on the floor the traditional way with warm hospitality.",
    cuisine: "Sindhi",
    priceRange: "$",
    rating: 4.6,
    reviews: 238,
    location: "Qasimabad, Hyderabad",
    address: "Main Qasimabad Chowk, Hyderabad",
    phone: "+92 22 2654321",
    openingTime: "12:00",
    closingTime: "23:00",
    image: "/restaurant_6.png",
    chef: "Rukhsana Memon",
    tags: ["Haleem", "Sindhi Biryani", "Dastarkhwan", "Vegetarian Friendly"],
    availableSlots: ["12:30", "13:30", "18:30", "19:30", "20:30", "21:30"],
    featured: true,
    exclusive: false,
  },
  {
    name: "Karakoram Karahi",
    slug: "karakoram-karahi",
    description:
      "Northern-style karahi house in Latifabad. Peshawari chapli kebabs, black-pepper karahi and lamb chops grilled on the roadside fire that made the North famous.",
    cuisine: "Peshawari",
    priceRange: "$$",
    rating: 4.5,
    reviews: 186,
    location: "Latifabad No. 7, Hyderabad",
    address: "Unit No. 7 Main Road, Latifabad, Hyderabad",
    phone: "+92 22 3876543",
    openingTime: "17:00",
    closingTime: "00:00",
    image: "/restaurant_2.jpg",
    chef: "Gulzar Khan",
    tags: ["Chapli Kabab", "Karahi", "Lamb Chops", "Roadside Fire"],
    availableSlots: ["17:30", "18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Phuleli Fish House",
    slug: "phuleli-fish-house",
    description:
      "River-fresh fish from the Phuleli, fried the Sindhi coastal way with rice and raita. A breezy open-air deck for long Friday lunches with friends.",
    cuisine: "Seafood",
    priceRange: "$$",
    rating: 4.4,
    reviews: 121,
    location: "Phuleli, Hyderabad",
    address: "Phuleli Canal Road, Hyderabad",
    phone: "+92 22 2109876",
    openingTime: "12:00",
    closingTime: "22:00",
    image: "/restaurant_3.jpg",
    chef: "Waseem Brohi",
    tags: ["River Fish", "Open Air", "Fried Fish", "Friday Special"],
    availableSlots: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Ember & Thyme",
    slug: "ember-and-thyme",
    description:
      "Hyderabad's modern grill house — wood-fired steaks and continental platters with a desi soul, set in a garden courtyard off the main boulevard. Date-night friendly.",
    cuisine: "Continental",
    priceRange: "$$$",
    rating: 4.7,
    reviews: 94,
    location: "Latifabad No. 8, Hyderabad",
    address: "Taimooria Chowk Road, Latifabad, Hyderabad",
    phone: "+92 22 3890123",
    openingTime: "18:00",
    closingTime: "23:00",
    image: "/restaurant_5.png",
    chef: "Danish Sheikh",
    tags: ["Wood Fire", "Steaks", "Garden Courtyard", "Date Night"],
    availableSlots: ["18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Gul Rang Chai & Sweets",
    slug: "gul-rang-chai",
    description:
      "An old-town tea house serving Hyderabadi chai, khaja, gulab jamun and a small halwa-soaked breakfast menu under Gul Rang's famous pressed-tin ceiling.",
    cuisine: "Tea & Sweets",
    priceRange: "$",
    rating: 4.6,
    reviews: 152,
    location: "Shahi Bazaar, Hyderabad",
    address: "Shahi Bazaar Old City, Hyderabad",
    phone: "+92 22 2612345",
    openingTime: "07:30",
    closingTime: "20:00",
    image: "/restaurant_4.png",
    chef: "Noor-ul-Ain",
    tags: ["Chai", "Khaja", "Breakfast", "Old City"],
    availableSlots: ["08:00", "09:00", "10:00", "17:00", "18:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Indus Clay Oven",
    slug: "indus-clay-oven",
    description:
      "Tandoori and clay-pot cooking inspired by the Indus Valley — naan fresh from a six-foot clay oven, slow-roasted lamb shoulder, and smoky paneer tikka under a reed-mat canopy.",
    cuisine: "BBQ & Balochi",
    priceRange: "$$",
    rating: 4.5,
    reviews: 178,
    location: "Heerabad, Hyderabad",
    address: "Main Heerabad Road, Hyderabad",
    phone: "+92 22 3801234",
    openingTime: "12:00",
    closingTime: "23:00",
    image: "/restaurant_1.png",
    chef: "Tariq Hussain",
    tags: ["Tandoori", "Clay Oven", "Lamb", "Paneer Tikka"],
    availableSlots: ["12:00", "13:00", "18:00", "19:00", "20:00", "21:00"],
    featured: true,
    exclusive: false,
  },
  {
    name: "Saffron Terrace",
    slug: "saffron-terrace",
    description:
      "A rooftop fine-dining experience with panoramic views of the Indus. Mughlai-inspired tasting menus, saffron-infused biryanis, and hand-pulled roomali roti.",
    cuisine: "Continental",
    priceRange: "$$$$",
    rating: 4.9,
    reviews: 67,
    location: "Civil Lines, Hyderabad",
    address: "Thandi Sarak, Civil Lines, Hyderabad",
    phone: "+92 22 2711111",
    openingTime: "18:00",
    closingTime: "23:30",
    image: "/restaurant_5.png",
    chef: "Irfan Patel",
    tags: ["Rooftop", "Tasting Menu", "Mughlai", "Date Night"],
    availableSlots: ["18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: true,
    exclusive: true,
  },
  {
    name: "Thar Express Dhaba",
    slug: "thar-express-dhaba",
    description:
      "A highway-style dhaba in the city — charpoys, string lights, and enormous karahi servings. Truck-stop vibe with dal fry, aloo gosht, and masala chai that keeps drivers awake all night.",
    cuisine: "Sindhi",
    priceRange: "$",
    rating: 4.3,
    reviews: 312,
    location: "Bypass Road, Hyderabad",
    address: "National Highway Bypass, Hyderabad",
    phone: "+92 22 3456789",
    openingTime: "06:00",
    closingTime: "02:00",
    image: "/restaurant_6.png",
    chef: "Ghulam Haider",
    tags: ["Dhaba", "Karahi", "Chai", "Late Night"],
    availableSlots: ["12:00", "13:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Porto Mediterranean",
    slug: "porto-mediterranean",
    description:
      "Mediterranean-meets-Sindhi fusion — hummus with kalonji, grilled halloumi with green chutney, and thin-crust pizza from a wood-fired oven. A modern café with an open kitchen.",
    cuisine: "Continental",
    priceRange: "$$$",
    rating: 4.6,
    reviews: 89,
    location: "Latifabad No. 10, Hyderabad",
    address: "Unit No. 10 Market Road, Latifabad, Hyderabad",
    phone: "+92 22 3891234",
    openingTime: "12:00",
    closingTime: "23:00",
    image: "/restaurant_3.jpg",
    chef: "Aisha Noor",
    tags: ["Mediterranean", "Fusion", "Wood-Fired Pizza", "Open Kitchen"],
    availableSlots: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Keenjhar Katchi Biryani",
    slug: "keenjhar-katchi-biryani",
    description:
      "Katchi biryani cooked the real way — layered raw marinated mutton with basmati, sealed with dough, and slow-steamed for four hours. No shortcuts, no parboiling.",
    cuisine: "Sindhi",
    priceRange: "$$",
    rating: 4.7,
    reviews: 245,
    location: "Qasimabad, Hyderabad",
    address: "Block B, Qasimabad, Hyderabad",
    phone: "+92 22 2698765",
    openingTime: "11:30",
    closingTime: "22:30",
    image: "/restaurant_2.jpg",
    chef: "Rashid Lashari",
    tags: ["Katchi Biryani", "Dum Pukht", "Mutton", "Authentic"],
    availableSlots: ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"],
    featured: true,
    exclusive: false,
  },
  {
    name: "Dragon Wok House",
    slug: "dragon-wok-house",
    description:
      "Indo-Chinese street food elevated — chili garlic noodles, Manchurian platters, and fiery dragon chicken served in a neon-lit space with hip-hop beats.",
    cuisine: "Continental",
    priceRange: "$$",
    rating: 4.2,
    reviews: 198,
    location: "Latifabad No. 5, Hyderabad",
    address: "Unit No. 5 Main Market, Latifabad, Hyderabad",
    phone: "+92 22 3845678",
    openingTime: "16:00",
    closingTime: "00:00",
    image: "/restaurant_4.png",
    chef: "Tony Lin",
    tags: ["Indo-Chinese", "Noodles", "Street Food", "Late Night"],
    availableSlots: ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Koel Garden Café",
    slug: "koel-garden-cafe",
    description:
      "A sun-dappled garden café tucked behind the old library — avocado toasts, specialty pour-over coffee, fresh juices, and all-day breakfast platters under mango trees.",
    cuisine: "Tea & Sweets",
    priceRange: "$$",
    rating: 4.4,
    reviews: 134,
    location: "Saddar, Hyderabad",
    address: "Library Road, Saddar, Hyderabad",
    phone: "+92 22 2723456",
    openingTime: "08:00",
    closingTime: "21:00",
    image: "/restaurant_5.png",
    chef: "Maryam Khan",
    tags: ["Garden Café", "Breakfast", "Coffee", "Healthy"],
    availableSlots: ["08:00", "09:00", "10:00", "12:00", "13:00", "18:00", "19:00"],
    featured: false,
    exclusive: false,
  },
  {
    name: "Sultan's Seafood Deck",
    slug: "sultans-seafood-deck",
    description:
      "Fresh catch from Keamari brought daily — grilled jumbo prawns, masala crab, and fish tikka served on an open-air wooden deck with river views.",
    cuisine: "Seafood",
    priceRange: "$$$",
    rating: 4.8,
    reviews: 203,
    location: "Riverside, Hyderabad",
    address: "Indus River Road, Hyderabad",
    phone: "+92 22 2198765",
    openingTime: "12:00",
    closingTime: "23:00",
    image: "/restaurant_3.jpg",
    chef: "Sultan Mallah",
    tags: ["Fresh Catch", "Grilled Prawns", "River View", "Premium"],
    availableSlots: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
    featured: true,
    exclusive: true,
  },
  {
    name: "Khyber Shinwari Dera",
    slug: "khyber-shinwari-dera",
    description:
      "Authentic Shinwari style barbecue and lamb karahi — cooked exclusively with animal fat and natural salt. Served in open-air private huts with traditional Peshawari kahwa.",
    cuisine: "Peshawari",
    priceRange: "$$",
    rating: 4.7,
    reviews: 184,
    location: "Auto Bhan Road, Hyderabad",
    address: "Opposite Latifabad Gate, Auto Bhan, Hyderabad",
    phone: "+92 22 3881122",
    openingTime: "17:00",
    closingTime: "01:00",
    image: "/restaurant_2.jpg",
    chef: "Sher Khan Shinwari",
    tags: ["Shinwari Karahi", "Lamb Tikka", "Dera Huts", "Peshawari Kahwa"],
    availableSlots: ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    featured: true,
    exclusive: false,
  },
  {
    name: "Café De Latif",
    slug: "cafe-de-latif",
    description:
      "Chic European bistro meets artisanal roastery. Handcrafted sourdough tartines, wood-fired lasagna, and velvety flat whites in an airy, botanical greenhouse setting.",
    cuisine: "Continental",
    priceRange: "$$$",
    rating: 4.8,
    reviews: 142,
    location: "Latifabad No. 3, Hyderabad",
    address: "Boulevard Lane 3, Latifabad, Hyderabad",
    phone: "+92 22 3874400",
    openingTime: "09:00",
    closingTime: "23:30",
    image: "/restaurant_5.png",
    chef: "Zara Merchant",
    tags: ["Artisan Bakery", "Specialty Coffee", "Italian Bistro", "Greenhouse"],
    availableSlots: ["09:00", "11:00", "13:00", "15:00", "18:00", "20:00", "21:30"],
    featured: false,
    exclusive: true,
  },
];

const tableCapacities = [2, 2, 4, 4, 6, 8];

const isoDaysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const seedData = async () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set - add it to server/.env first.");
    process.exit(1);
  }

  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);

    console.log("Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Table.deleteMany({}),
      Booking.deleteMany({}),
      BookingLock.deleteMany({}),
    ]);

    console.log("Creating demo users...");
    const salt = await bcrypt.genSalt(10);
    const hash = (pw: string) => bcrypt.hash(pw, salt);

    await User.create({
      name: "Platform Admin",
      email: "admin@velvettable.pk",
      password: await hash("Admin@1234"),
      phone: "03001234567",
      role: "admin",
    });
    const ownerUser = await User.create({
      name: "Sohail Ahmed",
      email: "owner@velvettable.pk",
      password: await hash("Owner@1234"),
      phone: "03001234568",
      role: "owner",
    });
    const customerUser = await User.create({
      name: "Ahmed Raza",
      email: "diner@velvettable.pk",
      password: await hash("Diner@1234"),
      phone: "03001234569",
      role: "user",
    });

    console.log("Creating restaurants, tables and sample bookings...");
    const today = todayLocalISO();

    for (let i = 0; i < restaurantData.length; i++) {
      const data = restaurantData[i];
      const restaurant = await Restaurant.create({
        ...data,
        owner: ownerUser._id,
        status: "approved",
        totalSeats: tableCapacities.reduce((a, b) => a + b, 0),
      });

      const tables = [];
      for (let t = 0; t < tableCapacities.length; t++) {
        const table = await Table.create({
          restaurant: restaurant._id,
          tableNumber: `T${t + 1}`,
          capacity: tableCapacities[t],
        });
        tables.push(table);
      }

      const sampleBookings: Array<{
        status: "pending" | "confirmed" | "completed" | "cancelled";
        dayOffset: number;
      }> = [
        { status: "pending", dayOffset: 1 },
        { status: "confirmed", dayOffset: 2 },
        { status: "completed", dayOffset: 3 },
        { status: "cancelled", dayOffset: 4 },
      ];

      for (let b = 0; b < sampleBookings.length; b++) {
        const sample = sampleBookings[b];
        const table = tables[b % tables.length];
        const slot = data.availableSlots[b % data.availableSlots.length];
        await Booking.create({
          user: customerUser._id,
          restaurant: restaurant._id,
          table: table._id,
          date: isoDaysFromNow(sample.dayOffset),
          startTime: slot,
          endTime: addMinutes(slot, MEAL_DURATION_MIN),
          partySize: Math.min(table.capacity, 2 + b),
          notes: sample.status === "cancelled" ? "Guest cancelled" : undefined,
          status: sample.status,
        });
      }
    }

    console.log(`Seeding complete (demo data starts ${today}).`);
    console.log("Demo accounts:");
    console.log("  Admin    -> admin@velvettable.pk / Admin@1234");
    console.log("  Owner    -> owner@velvettable.pk / Owner@1234");
    console.log("  Customer -> diner@velvettable.pk / Diner@1234");
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

void seedData();
