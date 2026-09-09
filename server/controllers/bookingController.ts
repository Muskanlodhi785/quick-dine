import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Table } from "../models/Table.js";
import { Booking } from "../models/Booking.js";
import {
  acquireTableLock,
  addMinutes,
  crossesMidnight,
  findConflictingBooking,
  isValidDateISO,
  isValidTime,
  MEAL_DURATION_MIN,
  releaseTableLock,
  todayLocalISO,
} from "../utils/bookings.js";

const populateRestaurant = "name slug location image address";
const populateTable = "tableNumber capacity";

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  // Phase 1 - validate the request shape.
  const { restaurantId, tableId, date, startTime, partySize, notes } = req.body;

  if (!restaurantId || !tableId || !date || !startTime || !partySize) {
    res.status(400).json({ message: "Please fill all the required fields" });
    return;
  }
  if (!isValidDateISO(date)) {
    res.status(400).json({ message: "Please provide a valid date (YYYY-MM-DD)" });
    return;
  }
  if (!isValidTime(startTime)) {
    res.status(400).json({ message: "Please provide a valid start time (HH:mm)" });
    return;
  }
  if (date < todayLocalISO()) {
    res.status(400).json({ message: "You cannot book a date in the past" });
    return;
  }
  const requestedParty = Number(partySize);
  if (!Number.isInteger(requestedParty) || requestedParty < 1 || requestedParty > 30) {
    res.status(400).json({ message: "Party size must be between 1 and 30 guests" });
    return;
  }

  if (!Types.ObjectId.isValid(restaurantId) || !Types.ObjectId.isValid(tableId)) {
    res.status(400).json({ message: "Invalid restaurant or table reference" });
    return;
  }

  try {
    // Phase 2 - verify the restaurant is bookable and the table belongs to it.
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    if (restaurant.status !== "approved") {
      res.status(400).json({ message: "Restaurant is not approved for bookings yet" });
      return;
    }
    if (!restaurant.availableSlots.includes(startTime)) {
      res.status(400).json({ message: `Time slot ${startTime} is not offered by this restaurant` });
      return;
    }
    if (crossesMidnight(startTime)) {
      res.status(400).json({
        message: `${startTime} is the restaurant's last seating - this window runs past midnight and cannot be booked. Please pick an earlier slot.`,
      });
      return;
    }

    const table = await Table.findOne({ _id: tableId, restaurant: restaurant._id });
    if (!table) {
      res.status(404).json({ message: "Table not found for this restaurant" });
      return;
    }
    if (!table.isActive) {
      res.status(400).json({ message: "This table is currently unavailable" });
      return;
    }
    if (requestedParty > table.capacity) {
      res.status(400).json({
        message: `Table ${table.tableNumber} seats ${table.capacity} guests - too small for a party of ${requestedParty}`,
      });
      return;
    }

    const endTime = addMinutes(startTime, MEAL_DURATION_MIN);

    // Phase 3 - serialize concurrent attempts for the same table + day, then
    // re-check overlap inside the lock so two simultaneous requests cannot both pass.
    const locked = await acquireTableLock(table._id, date);
    if (!locked) {
      res.status(409).json({
        message: "This table is being booked right now - please retry or pick another time",
      });
      return;
    }

    try {
      const conflict = await findConflictingBooking({
        tableId: table._id,
        date,
        startTime,
        endTime,
      });
      if (conflict) {
        res.status(409).json({
          message: `Table ${table.tableNumber} is already reserved on ${date} from ${conflict.startTime} to ${conflict.endTime}. Please choose another time or table.`,
        });
        return;
      }

      const booking = new Booking({
        user: req.user?._id,
        restaurant: restaurant._id,
        table: table._id,
        date,
        startTime,
        endTime,
        partySize: requestedParty,
        notes: notes ? String(notes).slice(0, 500) : undefined,
        status: "pending",
      });

      try {
        await booking.save(); // pre('save') assigns the bookingId
      } catch (err: any) {
        // Unique-index backstop: an identical booking slipped in between check and insert.
        if (err && err.code === 11000) {
          res.status(409).json({
            message: `Table ${table.tableNumber} was just reserved for ${startTime} by someone else. Please choose another time or table.`,
          });
          return;
        }
        throw err;
      }

      await booking.populate([
        { path: "restaurant", select: populateRestaurant },
        { path: "table", select: populateTable },
      ]);
      res.status(201).json(booking);
    } finally {
      await releaseTableLock(table._id, date);
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not create booking, please try again" });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate([{ path: "restaurant", select: populateRestaurant }, { path: "table", select: populateTable }])
      .sort({ date: -1, startTime: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not load your bookings" });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "You are not authorized to cancel this booking" });
      return;
    }
    if (booking.status === "completed" || booking.status === "cancelled") {
      res.status(400).json({ message: `A ${booking.status} booking cannot be cancelled` });
      return;
    }

    booking.status = "cancelled";
    await booking.save();
    await booking.populate([
      { path: "restaurant", select: populateRestaurant },
      { path: "table", select: populateTable },
    ]);
    res.json(booking);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Could not cancel booking" });
  }
};
