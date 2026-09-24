import asyncHandler from '../utils/asyncHandler.js';
import Reservation from '../models/Reservation.js';

// @desc    Create new table reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const { name, phone, email, date, time, numberOfGuests, specialRequest } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user missing');
  }

  const reservation = await Reservation.create({
    name,
    phone,
    email: email || req.user.email || '',
    date,
    time,
    numberOfGuests,
    specialRequest: specialRequest || '',
    user: req.user._id,
    status: 'Pending',
  });

  res.status(201).json({
    success: true,
    message: 'Table reservation request submitted successfully. We will confirm shortly!',
    reservation,
  });
});

// @desc    Get current user reservations
// @route   GET /api/reservations/my
// @access  Private
export const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: reservations.length, reservations });
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
export const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: reservations.length, reservations });
});

// @desc    Update reservation status
// @route   PATCH /api/reservations/:id/status
// @access  Private/Admin
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  reservation.status = status;
  const updatedReservation = await reservation.save();

  res.json({
    success: true,
    message: `Reservation status changed to ${status}`,
    reservation: updatedReservation,
  });
});
