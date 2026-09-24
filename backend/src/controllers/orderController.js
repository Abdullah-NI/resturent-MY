import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Logged In)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, subtotal, deliveryFee, total, customerName, phone, address, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Verify existence and availability of all ordered dishes against MongoDB
  for (const item of items) {
    const itemId = item.menuItem || item._id;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400);
      throw new Error(
        item.name
          ? `"${item.name}" is no longer available. Please remove it from your cart.`
          : 'This item is no longer available. Please remove it from your cart.'
      );
    }

    const dbItem = await MenuItem.findById(itemId);
    if (!dbItem) {
      res.status(400);
      throw new Error(
        item.name
          ? `"${item.name}" is no longer available. Please remove it from your cart.`
          : 'This item is no longer available. Please remove it from your cart.'
      );
    }

    if (dbItem.isAvailable === false) {
      res.status(400);
      throw new Error(`"${dbItem.name}" is currently sold out and cannot be ordered. Please remove it from your cart.`);
    }
  }

  const order = await Order.create({
    user: req.user ? req.user._id : null,
    items,
    subtotal,
    deliveryFee: deliveryFee || 0,
    total,
    customerName,
    phone,
    address,
    paymentMethod: paymentMethod || 'COD',
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
    orderStatus: 'Pending',
    notes: notes || '',
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (Track Order by ID or User/Admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let order;

  if (mongoose.Types.ObjectId.isValid(id)) {
    order = await Order.findById(id);
  }

  if (!order) {
    order = await Order.findOne({ orderNumber: id.toUpperCase().trim() });
  }

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Authorization check: If the order belongs to a specific user, enforce owner/admin check
  if (order.user) {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized to access this order');
    }
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Access denied. You can only view your own orders.');
    }
  }

  res.json({ success: true, order });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  const updatedOrder = await order.save();
  res.json({ success: true, message: 'Order status updated', order: updatedOrder });
});
