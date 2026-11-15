import { Restaurant } from "../models/Restaurant.js";
import { v2 as cloudinary } from "cloudinary";
import { Booking } from "../models/Booking.js";
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "quickdine" }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Failed to upload image"));
                return;
            }
            resolve({ secure_url: result.secure_url });
        });
        stream.end(fileBuffer);
    });
};
export const getOwnerRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id });
        if (!restaurant) {
            res.status(404).json(null);
            return;
        }
        console.log("Restaurant status from DB:", restaurant.status);
        res.json(restaurant);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const createOwnerRestaurant = async (req, res) => {
    try {
        const existing = await Restaurant.findOne({ owner: req.user?._id });
        if (existing) {
            res.status(400).json({ message: "You already have a restaurant" });
            return;
        }
        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;
        if (!name || !description || !cuisine || !priceRange || !location || !address || !chef) {
            res.status(400).json({ message: "Please fill all the required fields" });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/ /g, "-");
        const slugExists = await Restaurant.findOne({ slug });
        if (slugExists) {
            res.status(400).json({ message: "a restaurant with this name already exists" });
            return;
        }
        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }
        const parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags || [];
        const parsedSlots = typeof availableSlots === "string" ? availableSlots.split(",").map((t) => t.trim()) : availableSlots || ["17:00", "18:00", "19:00", "20:00", "21:00"];
        const restaurant = await Restaurant.create({
            name,
            slug,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: totalSeats ? Number(totalSeats) : 20,
            owner: req.user?._id,
            status: "pending"
        });
        res.status(201).json(restaurant);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const updateOwnerRestaurant = async (req, res) => {
    try {
        const resaurant = await Restaurant.findOne({ owner: req.user?._id });
        if (!resaurant) {
            res.status(404).json({ message: "restaurant profile not found" });
            return;
        }
        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;
        if (name)
            resaurant.name = name;
        if (description)
            resaurant.description = description;
        if (cuisine)
            resaurant.cuisine = cuisine;
        if (priceRange)
            resaurant.priceRange = priceRange;
        if (location)
            resaurant.location = location;
        if (address)
            resaurant.address = address;
        if (chef)
            resaurant.chef = chef;
        if (totalSeats)
            resaurant.totalSeats = totalSeats;
        if (tags) {
            resaurant.tags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
        }
        if (availableSlots) {
            resaurant.availableSlots = typeof availableSlots === "string" ? availableSlots.split(",").map((t) => t.trim()) : availableSlots;
        }
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            resaurant.image = result.secure_url;
        }
        const updated = await resaurant.save();
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const getOwnerbookings = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id });
        if (!restaurant) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        const bookings = await Booking.find({ restaurant: restaurant._id }).populate("user", "name email phone").sort({ date: -1, time: -1 });
        res.json(bookings);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !["confirmed", "cancelled"].includes(status)) {
            res.status(400).json({ message: "Please provide a valid status" });
            return;
        }
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }
        const restaurant = await Restaurant.findById(booking.restaurant);
        if (!restaurant || restaurant.owner.toString() !== req.user?._id.toString()) {
            res.status(404).json({ message: "Not authorized to update this booking" });
            return;
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
