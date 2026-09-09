import { Request, Response } from "express";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  addMinutes,
  crossesMidnight,
  isValidDateISO,
  MEAL_DURATION_MIN,
  rangesOverlap,
} from "../utils/bookings.js";

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

/* ---------------------------------- list --------------------------------- */

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;
    const queryObj: Record<string, unknown> = { status: "approved" };

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (priceRange) {
      const prices = Array.isArray(priceRange)
        ? priceRange.filter((p) => typeof p === "string" && PRICE_RANGES.includes(p))
        : typeof priceRange === "string" && PRICE_RANGES.includes(priceRange)
          ? [priceRange]
          : [];
      if (prices.length) queryObj.priceRange = { $in: prices };
    }
    if (rating) {
      const parsed = parseFloat(String(rating));
      if (!Number.isNaN(parsed)) queryObj.rating = { $gte: parsed };
    }
    if (location) {
      queryObj.location = { $regex: location, $options: "i" };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "price_low") sortOption = { priceRange: 1 };
    else if (sort === "price_high") sortOption = { priceRange: -1 };

    const restaurants = await Restaurant.find(queryObj).sort(sortOption);
    res.json(restaurants);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load restaurants" });
  }
};

export const getFeaturedRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    })
      .sort({ rating: -1 })
      .limit(6);
    res.json(featured);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load featured restaurants" });
  }
};

/* ----------------------------- detail by slug ---------------------------- */

export const getRestaurantBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    // Public listing only for approved restaurants.
    if (restaurant.status === "approved") {
      res.json(restaurant);
      return;
    }

    // Non-approved (pending/rejected): visible only to its owner or an admin.
    let authorized = false;
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id);
        if (user) {
          const isAdmin = user.role === "admin";
          const isOwner =
            user.role === "owner" && restaurant.owner.toString() === user._id.toString();
          authorized = isAdmin || isOwner;
        }
      } catch {
        authorized = false;
      }
    }

    if (!authorized) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load restaurant" });
  }
};

/* --------------------------- table availability --------------------------- */

export const getRestaurantAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date || !isValidDateISO(date)) {
      res.status(400).json({ message: "Please provide a valid date (YYYY-MM-DD)" });
      return;
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || restaurant.status !== "approved") {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    const partySize = Math.max(1, parseInt(String(req.query.partySize || "2"), 10) || 2);

    const [tables, dayBookings] = await Promise.all([
      Table.find({ restaurant: restaurant._id, isActive: true }).sort({ capacity: 1 }),
      Booking.find({
        restaurant: restaurant._id,
        date,
        status: { $in: ["pending", "confirmed"] },
      }),
    ]);

    // Slots whose 90-minute window would cross midnight cannot be booked safely.
    const bookableSlots = (restaurant.availableSlots ?? []).filter((slot) => !crossesMidnight(slot));

    const availability = bookableSlots.map((slot) => {
      const end = addMinutes(slot, MEAL_DURATION_MIN);
      const freeTables = tables.filter(
        (table) =>
          table.capacity >= partySize &&
          !dayBookings.some(
            (b) =>
              b.table.toString() === table._id.toString() &&
              rangesOverlap(slot, end, b.startTime, b.endTime)
          )
      );
      return {
        time: slot,
        available: freeTables.length > 0,
        availableSeats: freeTables.reduce((sum, t) => sum + t.capacity, 0),
        tables: freeTables.map((t) => ({
          _id: t._id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
        })),
      };
    });

    res.json(availability);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load availability" });
  }
};

/* ------------------------- Gemini recommendations ------------------------- */

interface CandidateRestaurant {
  slug: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  location: string;
  tags: string[];
  description: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    }),
  });
  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }
  const data: any = await response.json();
  const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("");
}

const parseRecommendationJson = (raw: string): Array<{ slug: string; reason: string }> => {
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed)
      ? parsed.filter(
          (item: any) =>
            item &&
            typeof item.slug === "string" &&
            typeof item.reason === "string"
        )
      : [];
  } catch {
    return [];
  }
};

/**
 * Recommend restaurants using Gemini. Candidates always come from MongoDB;
 * the AI only ranks/selects them and explains why. It can never create or
 * confirm bookings - this endpoint performs no writes.
 */
export const recommendRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cuisine, location, preference } = req.query;
    const partySize = Math.max(
      1,
      parseInt(String(req.query.partySize || "2"), 10) || 2
    );
    const limit = Math.min(10, Math.max(1, parseInt(String(req.query.limit || "5"), 10) || 5));

    // 1. Pull candidate restaurants from MongoDB (approved only).
    const filter: Record<string, unknown> = { status: "approved" };
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (preference) {
      const words = String(preference)
        .split(/[\s,]+/)
        .filter((w) => w.length > 1);
      if (words.length) {
        filter.$or = words.map((word) => ({
          $or: [
            { name: { $regex: word, $options: "i" } },
            { cuisine: { $regex: word, $options: "i" } },
            { tags: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
          ],
        }));
      }
    }

    const candidates = await Restaurant.find(filter).sort({ rating: -1 }).limit(25).lean();
    if (!candidates.length) {
      res.json({ recommendations: [], source: "ai" });
      return;
    }

    const candidateData: CandidateRestaurant[] = candidates.map((r) => ({
      slug: r.slug,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      rating: r.rating,
      location: r.location,
      tags: r.tags ?? [],
      description: (r.description || "").slice(0, 140),
    }));

    const reasonById = new Map<string, string>();
    let aiUsed = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = [
          `You are a restaurant concierge inside a table-booking app.`,
          `Party size: ${partySize}.`,
          cuisine ? `Cuisine preference: ${cuisine}.` : "",
          location ? `Location preference: ${location}.` : "",
          preference ? `User preference / vibe: ${preference}.` : "",
          ``,
          `Below is the ONLY list of restaurants available (from our database).`,
          `Choose the best ${limit} for this party and return a JSON array only, no prose,`,
          `each item as {"slug":"<slug>","reason":"<one short line, max 80 chars>"}.`,
          ``,
          JSON.stringify(candidateData),
        ]
          .filter(Boolean)
          .join("\n");

        const raw = await askGemini(prompt);
        const picks = parseRecommendationJson(raw);
        for (const pick of picks) {
          if (candidateData.some((c) => c.slug === pick.slug)) {
            reasonById.set(pick.slug, pick.reason.slice(0, 120));
          }
        }
        aiUsed = true;
      } catch (err) {
        console.error("Gemini recommendation failed:", err);
        aiUsed = false;
      }
    }

    // 2. Compose the final list: AI-picked order first, then top-rated fallback.
    const picked = candidates.filter((c) => reasonById.has(c.slug));
    const fallbackCount = Math.max(0, limit - picked.length);
    const fallback = candidates
      .filter((c) => !reasonById.has(c.slug))
      .slice(0, fallbackCount);

    const ordered = [...picked, ...fallback].slice(0, limit);
    const recommendations = ordered.map((r) => ({
      ...r,
      reason: reasonById.get(r.slug) ?? "Highly rated by our guests",
    }));

    res.json({ recommendations, source: aiUsed ? "ai" : "db-fallback" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load recommendations" });
  }
};
