import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  if (cart.items && cart.items.length > 0) {
    const itemIds = cart.items
      .map((i) => i.menuItem || i._id)
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    const validMenuItems = await MenuItem.find({ _id: { $in: itemIds } }).select('_id');
    const validIdSet = new Set(validMenuItems.map((m) => m._id.toString()));

    const initialCount = cart.items.length;
    cart.items = cart.items.filter((i) => {
      const idStr = (i.menuItem || i._id)?.toString();
      return idStr && validIdSet.has(idStr);
    });

    if (cart.items.length !== initialCount) {
      await cart.save();
    }
  }

  res.json({ success: true, items: cart.items });
});

// @desc    Sync/update current user's cart items
// @route   POST /api/cart
// @access  Private
export const updateCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const rawItems = Array.isArray(items) ? items : [];

  const formattedItems = rawItems.map((i) => ({
    ...i,
    menuItem: i.menuItem || i._id,
  }));

  let validCartItems = formattedItems;
  if (formattedItems.length > 0) {
    const itemIds = formattedItems
      .map((i) => i.menuItem)
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    const validMenuItems = await MenuItem.find({ _id: { $in: itemIds } }).select('_id');
    const validIdSet = new Set(validMenuItems.map((m) => m._id.toString()));

    validCartItems = formattedItems.filter((i) => {
      const idStr = i.menuItem?.toString();
      return idStr && validIdSet.has(idStr);
    });
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: validCartItems },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, message: 'Cart synced successfully', items: cart.items });
});

// @desc    Clear current user's cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Cart cleared successfully', items: cart.items });
});
