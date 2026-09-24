import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import {
  getCloudinaryFolderPath,
  optimizeCloudinaryUrl,
  safeDeleteCloudinaryImage,
} from '../utils/cloudinaryHelper.js';

// @desc    Upload an image to Cloudinary (Menu or Gallery)
// @route   POST /api/admin/upload/image
// @access  Private/Admin
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image file to upload');
  }

  const type = req.body.type || 'menu'; // 'menu' or 'gallery'
  const categoryInput = req.body.category || req.body.folder || '';

  // Determine structured Cloudinary folder path
  const folderPath = await getCloudinaryFolderPath(type, categoryInput);

  try {
    const result = await uploadToCloudinary(req.file.buffer, folderPath);
    const optimizedUrl = optimizeCloudinaryUrl(result.url);

    res.status(200).json({
      success: true,
      message: `Image uploaded successfully to Cloudinary under folder "${folderPath}"`,
      url: optimizedUrl,
      publicId: result.publicId,
      image: {
        url: optimizedUrl,
        publicId: result.publicId,
      },
      folder: folderPath,
    });
  } catch (err) {
    console.error('Cloudinary Upload Service Error:', err);
    res.status(400);

    let msg = err.message || 'Cloudinary upload failed.';
    if (msg.includes('whitelisted for unsigned uploads')) {
      msg = 'Cloudinary error: In your Cloudinary console, edit preset "skylounge_preset" and change Signing Mode to "Unsigned".';
    } else if (msg.includes('403') || msg.includes('missing permissions')) {
      msg = 'Cloudinary error: In your Cloudinary console, set Signing Mode of "skylounge_preset" to "Unsigned" or enable API key create permissions.';
    }

    throw new Error(msg);
  }
});

// @desc    Delete an image from Cloudinary with shared asset reference checking
// @route   DELETE /api/admin/upload/image
// @access  Private/Admin
export const deleteImage = asyncHandler(async (req, res) => {
  const publicId = req.body.publicId || req.query.publicId;

  if (!publicId) {
    res.status(400);
    throw new Error('Please provide the Cloudinary publicId of the image to delete');
  }

  const deleted = await safeDeleteCloudinaryImage(publicId);

  res.status(200).json({
    success: true,
    deleted,
    message: deleted
      ? 'Image deleted successfully from Cloudinary'
      : 'Cloudinary asset preserved because it is referenced by another record or could not be deleted',
  });
});
