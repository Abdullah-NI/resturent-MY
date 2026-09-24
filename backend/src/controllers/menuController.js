import asyncHandler from '../utils/asyncHandler.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Cart from '../models/Cart.js';
import { safeDeleteCloudinaryImage, optimizeCloudinaryUrl } from '../utils/cloudinaryHelper.js';
import { syncMenuItemToKnowledge, removeKnowledgeDoc } from '../services/ragService.js';
import { delPattern } from '../services/redisService.js';

// @desc    Get all menu items with search, filter & pagination
// @route   GET /api/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, isFeatured, isPopular, isAvailable, sort, page = 1, limit = 100 } = req.query;

  const query = {};

  if (category) {
    // Category can be ID or slug
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        query.category = catObj._id;
      }
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (isPopular !== undefined) query.isPopular = isPopular === 'true';
  if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

  let sortOption = { name: 1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  if (sort === 'price-desc') sortOption = { price: -1 };
  if (sort === 'popular') sortOption = { isPopular: -1, name: 1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await MenuItem.countDocuments(query);
  const items = await MenuItem.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: items.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    items,
  });
});

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('category', 'name slug');
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json({ success: true, item });
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, priceOptions, category, image, isAvailable, isFeatured, isPopular, preparationTime, tags } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Invalid category ID');
  }

  let formattedImage = { url: '', publicId: '' };
  if (image && typeof image === 'object') {
    formattedImage = {
      url: optimizeCloudinaryUrl(image.url || ''),
      publicId: image.publicId || '',
    };
  } else if (typeof image === 'string') {
    formattedImage = {
      url: optimizeCloudinaryUrl(image),
      publicId: '',
    };
  } else {
    formattedImage = {
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      publicId: '',
    };
  }

  const item = await MenuItem.create({
    name,
    description,
    price,
    priceOptions: priceOptions || [],
    category,
    image: formattedImage,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
    isPopular: isPopular !== undefined ? isPopular : false,
    preparationTime: preparationTime || '15-20 mins',
    tags: tags || ['Pure Veg', 'Sky Lounge Special'],
  });

  // Sync to RAG knowledge base & clear Redis cache
  syncMenuItemToKnowledge(item).catch((e) => console.warn('RAG sync error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.status(201).json({ success: true, message: 'Dish created successfully', item });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Record old publicId before updating
  const oldPublicId = item.image ? item.image.publicId : '';

  // Format new image URL if updated
  if (req.body.image && typeof req.body.image === 'object' && req.body.image.url) {
    req.body.image.url = optimizeCloudinaryUrl(req.body.image.url);
  }

  Object.assign(item, req.body);

  // 1. Upload new image first & save updated item in MongoDB
  const updatedItem = await item.save();

  // 2. Only AFTER save succeeds, safely remove old Cloudinary image if it was replaced and is unreferenced
  const newPublicId = updatedItem.image ? updatedItem.image.publicId : '';
  if (oldPublicId && oldPublicId !== newPublicId) {
    await safeDeleteCloudinaryImage(oldPublicId, updatedItem._id);
  }

  // Sync to RAG knowledge base & clear Redis cache
  syncMenuItemToKnowledge(updatedItem).catch((e) => console.warn('RAG sync error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.json({ success: true, message: 'Dish updated successfully', item: updatedItem });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  const publicIdToDelete = item.image ? item.image.publicId : '';
  const itemId = item._id;

  // 1. Delete associated Cloudinary image using publicId (only if not used by another Menu/Gallery item)
  if (publicIdToDelete) {
    await safeDeleteCloudinaryImage(publicIdToDelete, itemId);
  }

  // 2. Remove this deleted menu item from any shopping carts
  await Cart.updateMany(
    {},
    {
      $pull: {
        items: {
          $or: [{ menuItem: itemId }, { _id: itemId }],
        },
      },
    }
  );

  // 3. Delete Menu Item record from MongoDB
  await item.deleteOne();

  // Remove from RAG knowledge base & clear Redis cache
  removeKnowledgeDoc(itemId, 'menu_item').catch((e) => console.warn('RAG remove error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.json({ success: true, message: 'Dish and associated Cloudinary image processed successfully' });
});
