import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { createBooking, getMyBookings, cancelBookings } from '../controllers/bookingControllerr.js';
const bookingRouter = Router();
bookingRouter.post('/', protect, createBooking);
bookingRouter.get('/my', protect, getMyBookings);
bookingRouter.delete('/:id/cancel', protect, cancelBookings);
export default bookingRouter;
