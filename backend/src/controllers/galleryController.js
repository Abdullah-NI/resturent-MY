import asyncHandler from '../utils/asyncHandler.js';
import Gallery from '../models/Gallery.js';
import { safeDeleteCloudinaryImage, optimizeCloudinaryUrl } from '../utils/cloudinaryHelper.js';

// @desc    Get gallery images
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};
  const gallery = await Gallery.find(query).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: gallery.length, gallery });
});

// @desc    Add gallery image
// @route   POST /api/gallery
// @access  Private/Admin
export const addGalleryItem = asyncHandler(async (req, res) => {
  const { title, category, image, imageUrl, displayOrder } = req.body;

  let imageObj = { url: '', publicId: '' };
  if (image && typeof image === 'object') {
    imageObj = {
      url: optimizeCloudinaryUrl(image.url || ''),
      publicId: image.publicId || '',
    };
  } else if (typeof image === 'string') {
    imageObj = {
      url: optimizeCloudinaryUrl(image),
      publicId: '',
    };
  } else if (imageUrl) {
    imageObj = {
      url: optimizeCloudinaryUrl(imageUrl),
      publicId: '',
    };
  }

  const item = await Gallery.create({
    title,
    category: category || 'Food',
    image: imageObj,
    imageUrl: imageObj.url,
    displayOrder: displayOrder || 0,
  });

  res.status(201).json({ success: true, message: 'Gallery image added', item });
});

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Gallery item not found');
  }

  const publicIdToDelete = item.image ? item.image.publicId : (item.publicId || '');
  const itemId = item._id;

  // 1. Delete associated Cloudinary image using publicId (if not referenced elsewhere)
  if (publicIdToDelete) {
    await safeDeleteCloudinaryImage(publicIdToDelete, itemId);
  }

  // 2. Delete Gallery record from MongoDB
  await item.deleteOne();

  res.json({ success: true, message: 'Gallery item and associated Cloudinary image removed' });
});
