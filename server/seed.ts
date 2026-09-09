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
  image: string;
  chef: string;
  tags: string[];
  availableSlots: string[];
  featured: boolean;
  exclusive: boolean;
}

// Hyderabad (Sindh) lineup — Brohi Restaurant is the flagship brand.
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
    image: "/restaurant_4.png",
    chef: "Noor-ul-Ain",
    tags: ["Chai", "Khaja", "Breakfast", "Old City"],
    availableSlots: ["08:00", "09:00", "10:00", "17:00", "18:00"],
    featured: false,
    exclusive: false,
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
      email: "admin@brohi.pk",
      password: await hash("Admin@1234"),
      phone: "03001234567",
      role: "admin",
    });
    const ownerUser = await User.create({
      name: "Sohail Brohi",
      email: "owner@brohi.pk",
      password: await hash("Owner@1234"),
      phone: "03001234568",
      role: "owner",
    });
    const customerUser = await User.create({
      name: "Ahmed Raza",
      email: "diner@brohi.pk",
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
    console.log("  Admin    -> admin@brohi.pk / Admin@1234");
    console.log("  Owner    -> owner@brohi.pk / Owner@1234");
    console.log("  Customer -> diner@brohi.pk / Diner@1234");
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

void seedData();
