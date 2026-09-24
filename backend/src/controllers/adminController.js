import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Reservation from '../models/Reservation.js';

// @desc    Get real Admin Dashboard Stats from MongoDB
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

  // Today's orders
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysOrdersCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  // Total Revenue calculation
  const revenueAggregation = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  const totalUsers = await User.countDocuments({ role: 'customer' });
  const totalReservations = await Reservation.countDocuments();
  const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });
  const totalMenuItems = await MenuItem.countDocuments();

  // Recent 5 orders
  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent 5 reservations
  const recentReservations = await Reservation.find({})
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      totalOrders,
      todaysOrders: todaysOrdersCount,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalUsers,
      totalReservations,
      pendingReservations,
      totalMenuItems,
    },
    recentOrders,
    recentReservations,
  });
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Toggle user active status or role
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role) user.role = role;

  await user.save();
  res.json({ success: true, message: 'User updated successfully', user });
});

// @desc    Search users by name, email, or phone
// @route   GET /api/admin/users/search
// @access  Private/Admin
export const searchUsersForAdmin = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json({ success: true, users: [] });
  }

  const cleanQuery = q.trim();
  const regex = new RegExp(cleanQuery, 'i');

  // Search registered users
  const registeredUsers = await User.find({
    $or: [{ name: regex }, { email: regex }, { phone: regex }],
  })
    .select('_id name email phone role')
    .limit(10);

  const userList = registeredUsers.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isRegistered: true,
  }));

  // Also search guest orders by customerName or phone
  if (userList.length < 5) {
    const guestOrders = await Order.find({
      $or: [{ customerName: regex }, { phone: regex }],
      $or: [{ user: null }, { user: { $exists: false } }],
    })
      .select('customerName phone')
      .limit(10);

    const existingPhones = new Set(userList.map((u) => u.phone));
    for (const ord of guestOrders) {
      if (ord.phone && !existingPhones.has(ord.phone)) {
        existingPhones.add(ord.phone);
        userList.push({
          _id: null,
          name: ord.customerName,
          email: 'Guest Customer',
          phone: ord.phone,
          role: 'guest',
          isRegistered: false,
        });
      }
    }
  }

  res.json({ success: true, users: userList });
});

// @desc    Get user order history with stats, filters, and pagination for Admin
// @route   GET /api/admin/user-orders
// @access  Private/Admin
export const getUserOrderHistoryAdmin = asyncHandler(async (req, res) => {
  const { userId, search, orderStatus, startDate, endDate, page = 1, limit = 10 } = req.query;

  let userFilter = null;
  let userInfo = null;

  // 1. If userId is provided
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const userDoc = await User.findById(userId).select('-password');
    if (userDoc) {
      userInfo = {
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        isRegistered: true,
      };
      userFilter = {
        $or: [
          { user: userDoc._id },
          { phone: userDoc.phone },
          { customerName: new RegExp(`^${userDoc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        ],
      };
    }
  }

  // 2. If search string is provided (and user not yet found)
  if (!userInfo && search && search.trim()) {
    const cleanSearch = search.trim();
    const searchRegex = new RegExp(cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const userDoc = await User.findOne({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
    }).select('-password');

    if (userDoc) {
      userInfo = {
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        isRegistered: true,
      };
      userFilter = {
        $or: [
          { user: userDoc._id },
          { phone: userDoc.phone },
          { customerName: searchRegex },
        ],
      };
    } else {
      // Check Orders directly for guest customer
      const matchedOrder = await Order.findOne({
        $or: [{ customerName: searchRegex }, { phone: searchRegex }],
      });

      if (matchedOrder) {
        userInfo = {
          _id: null,
          name: matchedOrder.customerName,
          email: 'Guest Customer',
          phone: matchedOrder.phone,
          isRegistered: false,
        };
        userFilter = {
          $or: [{ customerName: searchRegex }, { phone: matchedOrder.phone }],
        };
      }
    }
  }

  if (!userInfo || !userFilter) {
    return res.status(404).json({
      success: false,
      message: 'No user or orders found matching search criteria',
    });
  }

  // Build query with filters
  const query = { ...userFilter };

  if (orderStatus && orderStatus !== 'All') {
    query.orderStatus = orderStatus;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Stats for this user
  const totalOrdersCount = await Order.countDocuments(userFilter);
  const totalSpentAgg = await Order.aggregate([
    { $match: { ...userFilter, orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalSpent: { $sum: '$total' } } },
  ]);
  const totalAmountSpent = totalSpentAgg.length > 0 ? totalSpentAgg[0].totalSpent : 0;

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const totalFilteredOrders = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    user: userInfo,
    stats: {
      totalOrders: totalOrdersCount,
      totalSpent: totalAmountSpent,
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalFilteredOrders / limitNum) || 1,
      totalFilteredOrders,
    },
    orders,
  });
});


