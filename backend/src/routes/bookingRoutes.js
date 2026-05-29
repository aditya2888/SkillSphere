const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getMyBookings);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

module.exports = router;
