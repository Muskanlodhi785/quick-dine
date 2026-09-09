import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Booking, BookingStatus } from "../models/Booking.js";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryReady } from "../config/cloudinary.js";

/* ------------------------------ cloudinary io ------------------------------ */

const uploadToCloudinary = (
  fileBuffer: Buffer
): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "quickdine" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Failed to upload image"));
          return;
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
  }
};

/* ---------------------------- restaurant helpers ---------------------------- */

const slugify = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const parseListField = (value: unknown): string[] => {
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
};

const getOwnRestaurant = async (req: AuthRequest) =>
  Restaurant.findOne({ owner: req.user?._id });

/* ------------------------------ restaurant crud ----------------------------- */

export const getOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await getOwnRestaurant(req);
    if (!restaurant) {
      res.status(404).json({ message: "No restaurant yet" });
      return;
    }
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await getOwnRestaurant(req);
    if (existing) {
      res.status(400).json({ message: "You already have a restaurant" });
      return;
    }

    const { name, description, cuisine, priceRange, location, address, chef } = req.body;
    if (!name || !description || !cuisine || !priceRange || !location || !address || !chef) {
      res.status(400).json({ message: "Please fill all the required fields" });
      return;
    }

    let slug = slugify(String(name));
    if (!slug) {
      res.status(400).json({ message: "Restaurant name cannot be used to create a slug" });
      return;
    }
    // Ensure uniqueness with a numeric suffix when needed.
    let baseSlug = slug;
    let counter = 2;
    while (await Restaurant.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let image = "";
    let imagePublicId = "";
    if (req.file && cloudinaryReady()) {
      const result = await uploadToCloudinary(req.file.buffer);
      image = result.secure_url;
      imagePublicId = result.public_id;
    }

    const restaurant = await Restaurant.create({
      name: String(name).trim(),
      slug,
      description: String(description).trim(),
      cuisine: String(cuisine).trim(),
      priceRange,
      location: String(location).trim(),
      address: String(address).trim(),
      chef: String(chef).trim(),
      image,
      imagePublicId,
      tags: parseListField(req.body.tags),
      availableSlots: parseListField(req.body.availableSlots).length
        ? parseListField(req.body.availableSlots)
        : ["17:00", "18:00", "19:00", "20:00", "21:00"],
      totalSeats: Number(req.body.totalSeats) > 0 ? Number(req.body.totalSeats) : 20,
      owner: req.user?._id,
      status: "pending",
    });

    res.status(201).json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateOwnerRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await getOwnRestaurant(req);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant profile not found" });
      return;
    }

    const { name, description, cuisine, priceRange, location, address, chef } = req.body;
    if (name) restaurant.name = String(name).trim();
    if (description) restaurant.description = String(description).trim();
    if (cuisine) restaurant.cuisine = String(cuisine).trim();
    if (priceRange) restaurant.priceRange = priceRange;
    if (location) restaurant.location = String(location).trim();
    if (address) restaurant.address = String(address).trim();
    if (chef) restaurant.chef = String(chef).trim();

    const tags = parseListField(req.body.tags);
    if (tags.length) restaurant.tags = tags;

    const slots = parseListField(req.body.availableSlots);
    if (slots.length) restaurant.availableSlots = slots;

    const seats = Number(req.body.totalSeats);
    if (seats > 0) restaurant.totalSeats = seats;

    // Regenerate the slug when the name changes (and keep it unique).
    if (name) {
      const newSlug = slugify(String(name));
      if (newSlug && newSlug !== restaurant.slug) {
        let candidate = newSlug;
        let counter = 2;
        const clash = await Restaurant.findOne({ slug: candidate, _id: { $ne: restaurant._id } });
        if (clash) {
          candidate = `${newSlug}-${counter++}`;
          while (await Restaurant.findOne({ slug: candidate, _id: { $ne: restaurant._id } })) {
            candidate = `${newSlug}-${counter++}`;
          }
        }
        restaurant.slug = candidate;
      }
    }

    if (req.file && cloudinaryReady()) {
      const result = await uploadToCloudinary(req.file.buffer);
      if (restaurant.imagePublicId) {
        await deleteFromCloudinary(restaurant.imagePublicId);
      }
      restaurant.image = result.secure_url;
      restaurant.imagePublicId = result.public_id;
    }

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

/* -------------------------------- table crud -------------------------------- */

export const getOwnTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await getOwnRestaurant(req);
    if (!restaurant) {
      res.status(404).json({ message: "No restaurant yet" });
      return;
    }
    const tables = await Table.find({ restaurant: restaurant._id }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await getOwnRestaurant(req);
    if (!restaurant) {
      res.status(404).json({ message: "No restaurant yet - create it first" });
      return;
    }

    const { tableNumber, capacity } = req.body;
    const seats = Number(capacity);
    if (!tableNumber || !Number.isInteger(seats) || seats < 1 || seats > 50) {
      res.status(400).json({ message: "Provide a table number and a capacity between 1 and 50" });
      return;
    }

    const table = await Table.create({
      restaurant: restaurant._id,
      tableNumber: String(tableNumber).trim(),
      capacity: seats,
    });
    res.status(201).json(table);
  } catch (error: any) {
    if (error && error.code === 11000) {
      res.status(400).json({ message: "A table with this number already exists" });
      return;
    }
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      res.status(404).json({ message: "Table not found" });
      return;
    }
    const restaurant = await Restaurant.findById(table.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "You can only manage tables of your own restaurant" });
      return;
    }

    const { tableNumber, capacity, isActive } = req.body;
    if (tableNumber !== undefined) table.tableNumber = String(tableNumber).trim();
    if (capacity !== undefined) {
      const seats = Number(capacity);
      if (!Number.isInteger(seats) || seats < 1 || seats > 50) {
        res.status(400).json({ message: "Capacity must be between 1 and 50" });
        return;
      }
      // Never shrink below an active booking's party size.
      const tooBig = await Booking.findOne({
        table: table._id,
        status: { $in: ["pending", "confirmed"] },
        partySize: { $gt: seats },
      });
      if (tooBig) {
        res.status(400).json({
          message: `Cannot reduce capacity below ${tooBig.partySize} - there is an active booking for ${tooBig.partySize} guests`,
        });
        return;
      }
      table.capacity = seats;
    }
    if (isActive !== undefined) table.isActive = Boolean(isActive);

    const updated = await table.save();
    res.json(updated);
  } catch (error: any) {
    if (error && error.code === 11000) {
      res.status(400).json({ message: "A table with this number already exists" });
      return;
    }
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      res.status(404).json({ message: "Table not found" });
      return;
    }
    const restaurant = await Restaurant.findById(table.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "You can only manage tables of your own restaurant" });
      return;
    }

    const active = await Booking.findOne({
      table: table._id,
      status: { $in: ["pending", "confirmed"] },
    });
    if (active) {
      res.status(400).json({
        message: `Table ${table.tableNumber} has active bookings - deactivate it instead of deleting`,
      });
      return;
    }
    await table.deleteOne();
    res.json({ message: "Table deleted" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ------------------------------- booking flow ------------------------------- */

export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await getOwnRestaurant(req);
    if (!restaurant) {
      res.status(404).json({ message: "No restaurant yet" });
      return;
    }
    const bookings = await Booking.find({ restaurant: restaurant._id })
      .populate([
        { path: "user", select: "name email phone" },
        { path: "table", select: "tableNumber capacity" },
      ])
      .sort({ date: -1, startTime: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const allowed: BookingStatus[] = ["confirmed", "cancelled", "completed"];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ message: "Please provide a valid status (confirmed, cancelled, completed)" });
      return;
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    const restaurant = await Restaurant.findById(booking.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "Not authorized to update this booking" });
      return;
    }

    const next = status as BookingStatus;
    if (!TRANSITIONS[booking.status].includes(next)) {
      res.status(400).json({
        message: `A ${booking.status} booking cannot be changed to ${next}`,
      });
      return;
    }

    booking.status = next;
    await booking.save();
    await booking.populate([{ path: "table", select: "tableNumber capacity" }]);
    res.json(booking);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
