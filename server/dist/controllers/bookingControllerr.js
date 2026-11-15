import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";
export const createBooking = async (req, res) => {
    try {
        const { restaurantId, date, time, guests, specialRequests } = req.body;
        if (!restaurantId || !date || !time || !guests) {
            res.status(400).json({ message: 'Please fill all the required fields' });
            return;
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }
        if (restaurant.status !== 'approved') {
            res.status(400).json({ message: 'Restaurant is not approved for bookings' });
            return;
        }
        const requestedGuests = Number(guests);
        const existingBookings = await Booking.find({
            restaurant: restaurant._id,
            date: new Date(date),
            time: time,
            status: 'confirmed'
        });
        const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);
        const totalSeats = restaurant.totalSeats || 20;
        const availableSeats = totalSeats - bookedSeats;
        if (requestedGuests > availableSeats) {
            res.status(400).json({ message: `Only ${availableSeats} seats are available for the selected time slot`,
            });
        }
        const booking = await Booking.create({
            user: req.user?._id,
            restaurant: restaurant._id,
            date: new Date(date),
            time: time,
            guests: Number(guests),
            specialRequests: specialRequests,
            status: 'confirmed'
        });
        const populatedBooking = await booking.populate('restaurant', 'new location image address');
        res.status(201).json(populatedBooking);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user?._id }).populate("restaurant", "name location image address slug").sort({ date: -1, time: -1 });
        res.json(bookings);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
export const cancelBookings = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: "booking not found" });
            return;
        }
        if (booking.user.toString() !== req.user?._id.toString()) {
            res.status(404).json({ message: "not authorized to cancel this booking " });
            return;
        }
        booking.status = "cancelled";
        await booking.save();
        const populatedBooking = await booking.populate("restaurant", "name location image address");
        res.json(populatedBooking);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
