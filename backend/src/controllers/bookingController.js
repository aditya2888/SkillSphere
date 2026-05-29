const Booking = require('../models/Booking');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { sendBookingEmail } = require('../utils/azureEmail');
const { trackEvent } = require('../utils/appInsights');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { skillId, mentorId, date, notes } = req.body;

    const booking = new Booking({
      skill: skillId,
      mentee: req.user.id,
      mentor: mentorId,
      date,
      notes,
    });

    const createdBooking = await booking.save();

    // 🔵 Azure Application Insights — track booking created
    trackEvent('BookingCreated', { bookingId: createdBooking._id.toString(), menteeId: req.user.id, mentorId, skillId });

    // 🔵 Azure Communication Services — send booking confirmation email
    try {
      const [mentee, mentor, skill] = await Promise.all([
        User.findById(req.user.id).select('name email'),
        User.findById(mentorId).select('name'),
        Skill.findById(skillId).select('title'),
      ]);
      if (mentee && mentor && skill) {
        sendBookingEmail({
          userName: mentee.name,
          userEmail: mentee.email,
          skillTitle: skill.title,
          mentorName: mentor.name,
          date,
        });
      }
    } catch (emailErr) {
      console.error('[AzureEmail] Booking email error:', emailErr.message);
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings (as mentee or mentor)
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookingsAsMentee = await Booking.find({ mentee: req.user.id })
      .populate('mentor', 'name email avatar')
      .populate('skill', 'title category');
      
    const bookingsAsMentor = await Booking.find({ mentor: req.user.id })
      .populate('mentee', 'name email avatar')
      .populate('skill', 'title category');

    res.json({
      asMentee: bookingsAsMentee,
      asMentor: bookingsAsMentor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      // Only mentor can confirm/complete. Mentee can cancel.
      // For simplicity, allowing either to change status for now.
      if (booking.mentor.toString() !== req.user.id && booking.mentee.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      booking.status = req.body.status || booking.status;
      const updatedBooking = await booking.save();
      
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
