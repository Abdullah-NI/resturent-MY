import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Cart from '../models/Cart.js';
import { safeDeleteCloudinaryImage } from '../utils/cloudinaryHelper.js';
import { syncCategoryToKnowledge, removeKnowledgeDoc } from '../services/ragService.js';
import { delPattern } from '../services/redisService.js';

// @desc    Get all categories (or popular categories if query popular=true)
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  
  // Admin can pass all=true to see inactive categories, otherwise show active only
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }

  if (req.query.popular === 'true') {
    filter.isPopular = true;
    const categories = await Category.find(filter).sort({ popularOrder: 1, displayOrder: 1, name: 1 });
    return res.json({ success: true, count: categories.length, categories });
  }

  const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
  res.json({ success: true, count: categories.length, categories });
});

// @desc    Get popular categories for Home page
// @route   GET /api/categories/popular
// @access  Public
export const getPopularCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, isPopular: true }).sort({ popularOrder: 1, displayOrder: 1, name: 1 });
  res.json({ success: true, count: categories.length, categories });
});

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, category });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, displayOrder, isPopular, popularOrder } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const existing = await Category.findOne({ slug });
  if (existing) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  let formattedImage = image;
  if (typeof image === 'string') {
    formattedImage = { url: image, publicId: '' };
  } else if (!image || (!image.url && !image.publicId)) {
    formattedImage = {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      publicId: '',
    };
  }

  const category = await Category.create({
    name,
    slug,
    description: description || '',
    image: formattedImage,
    displayOrder: displayOrder !== undefined ? displayOrder : 0,
    isPopular: isPopular !== undefined ? Boolean(isPopular) : false,
    popularOrder: popularOrder !== undefined ? Number(popularOrder) : 0,
  });

  // Sync to RAG knowledge base & clear Redis cache
  syncCategoryToKnowledge(category).catch((e) => console.warn('RAG sync error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.status(201).json({ success: true, message: 'Category created successfully', category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (req.body.name) {
    category.name = req.body.name;
    category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.displayOrder !== undefined) category.displayOrder = Number(req.body.displayOrder);
  if (req.body.popularOrder !== undefined) category.popularOrder = Number(req.body.popularOrder);
  if (req.body.isPopular !== undefined) category.isPopular = Boolean(req.body.isPopular);
  if (req.body.isActive !== undefined) category.isActive = Boolean(req.body.isActive);

  if (req.body.image !== undefined) {
    const oldPublicId = category.image?.publicId;
    let newImage = req.body.image;
    if (typeof newImage === 'string') {
      newImage = { url: newImage, publicId: '' };
    }
    
    category.image = newImage;

    // If publicId changed, safely delete old Cloudinary image
    if (oldPublicId && oldPublicId !== newImage?.publicId) {
      await safeDeleteCloudinaryImage(oldPublicId, category._id);
    }
  }

  const updatedCategory = await category.save();

  // Sync to RAG knowledge base & clear Redis cache
  syncCategoryToKnowledge(updatedCategory).catch((e) => console.warn('RAG sync error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.json({ success: true, message: 'Category updated successfully', category: updatedCategory });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const count = await MenuItem.countDocuments({ category: category._id });
  if (count > 0) {
    if (req.query.cascade === 'true') {
      const itemsInCat = await MenuItem.find({ category: category._id }).select('_id');
      const itemIds = itemsInCat.map((i) => i._id);

      // Clean up all user carts for deleted category items
      if (itemIds.length > 0) {
        await Cart.updateMany(
          {},
          {
            $pull: {
              items: {
                $or: [{ menuItem: { $in: itemIds } }, { _id: { $in: itemIds } }],
              },
            },
          }
        );
      }

      await MenuItem.deleteMany({ category: category._id });
    } else {
      res.status(400);
      throw new Error(
        `Cannot delete category '${category.name}' because ${count} menu item(s) belong to it. Please reassign or remove the dishes first.`
      );
    }
  }

  // Safely delete category image from Cloudinary if set
  if (category.image?.publicId) {
    await safeDeleteCloudinaryImage(category.image.publicId, category._id);
  }

  await category.deleteOne();

  // Remove from RAG knowledge base & clear Redis cache
  removeKnowledgeDoc(category._id, 'category').catch((e) => console.warn('RAG remove error:', e.message));
  delPattern('mcp:menu:*').catch((e) => console.warn('Redis cache clear error:', e.message));
  delPattern('rag:query:*').catch((e) => console.warn('Redis cache clear error:', e.message));

  res.json({
    success: true,
    message: req.query.cascade === 'true' && count > 0
      ? `Category '${category.name}' and ${count} associated menu item(s) deleted successfully`
      : `Category '${category.name}' deleted successfully`,
  });
});
