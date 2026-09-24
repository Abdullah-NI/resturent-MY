import MenuItem from '../models/MenuItem.js';
import Gallery from '../models/Gallery.js';
import Category from '../models/Category.js';
import { removeFromCloudinary } from '../config/cloudinary.js';

/**
  Normalizes category strings into exact requested Cloudinary folder slugs
  @param {string} categoryInput
  @returns {string}
 */
export const slugifyCategory = (categoryInput = '') => {
  if (!categoryInput) return 'general';

  let str = String(categoryInput).toLowerCase().trim();

  // Explicit mappings for menu categories requested
  const mappings = {
    'starter / snacks': 'starter-snacks',
    'starter-snacks': 'starter-snacks',
    'starter': 'starter-snacks',
    'chinese': 'chinese',
    'rice & noodle': 'rice-noodle',
    'rice-noodle': 'rice-noodle',
    'soup': 'soup',
    'shakes': 'shakes',
    'mocktails': 'mocktails',
    'tea & coffee': 'tea-coffee',
    'tea-coffee': 'tea-coffee',
    'pasta': 'pasta',
    'appetizer': 'appetizer',
    'momos': 'momos',
    'south indian / dosa': 'south-indian',
    'south-indian-dosa': 'south-indian',
    'south-indian': 'south-indian',
    'uttapam': 'uttapam',
    'main course': 'main-course',
    'main-course': 'main-course',
    'breads': 'breads',
    'rice & biryani': 'rice-biryani',
    'rice-biryani': 'rice-biryani',
    'raita': 'raita',
    'salad': 'salad',
    'pizza': 'pizza',
    'dessert': 'dessert',
    // Gallery category mappings
    'food': 'food',
    'ambience': 'ambience',
    'restaurant': 'restaurant',
    'events': 'events',
  };

  if (mappings[str]) {
    return mappings[str];
  }

  // Generic fallback slugifier
  const slug = str
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || 'general';
};

/**
  Determines the exact Cloudinary folder path according to requirements:
  sky-lounge/menu/<category-slug>
  sky-lounge/gallery/<category-slug>
  @param {string} type - 'menu' or 'gallery'
  @param {string} categoryInput - Category ID, name, or slug
  @returns {Promise<string>}
 */
export const getCloudinaryFolderPath = async (type = 'menu', categoryInput = '') => {
  let categoryNameOrSlug = categoryInput;

  // If categoryInput is a MongoDB ObjectId, fetch the category name from DB
  if (typeof categoryInput === 'string' && categoryInput.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const catDoc = await Category.findById(categoryInput);
      if (catDoc) {
        categoryNameOrSlug = catDoc.slug || catDoc.name;
      }
    } catch (e) {
      console.error('Error fetching Category for folder path:', e);
    }
  } else if (typeof categoryInput === 'object' && categoryInput !== null) {
    categoryNameOrSlug = categoryInput.slug || categoryInput.name || '';
  }

  const categorySlug = slugifyCategory(categoryNameOrSlug);

  if (type === 'gallery') {
    return `sky-lounge/gallery/${categorySlug}`;
  }

  return `sky-lounge/menu/${categorySlug}`;
};

/**
  Appends f_auto,q_auto transformations to Cloudinary URLs for optimal quality & delivery
  @param {string} url
  @returns {string}
 */
export const optimizeCloudinaryUrl = (url = '') => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/f_auto,q_auto/')) return url;

  // Insert f_auto,q_auto after /upload/
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

/**
  Safely deletes a Cloudinary asset by publicId ONLY if no other MenuItem or Gallery record uses it.
  Prevents orphaned images while protecting shared assets.
  @param {string} publicId
  @param {string|null} excludeDocId - MongoDB ObjectId of current document being deleted or updated
  @returns {Promise<boolean>} - True if deleted from Cloudinary, false if skipped or error
 */
export const safeDeleteCloudinaryImage = async (publicId, excludeDocId = null) => {
  if (!publicId || typeof publicId !== 'string') return false;

  const cleanPublicId = publicId.trim();
  if (!cleanPublicId) return false;

  // 1. Check MenuItem documents
  const menuQuery = { 'image.publicId': cleanPublicId };
  if (excludeDocId) {
    menuQuery._id = { $ne: excludeDocId };
  }
  const otherMenu = await MenuItem.findOne(menuQuery);
  if (otherMenu) {
    console.log(`Cloudinary asset "${cleanPublicId}" is still referenced by MenuItem (${otherMenu.name}). Skipping Cloudinary deletion.`);
    return false;
  }

  // 2. Check Gallery documents
  const galleryQuery = {
    $or: [
      { 'image.publicId': cleanPublicId },
      { publicId: cleanPublicId },
    ],
  };
  if (excludeDocId) {
    galleryQuery._id = { $ne: excludeDocId };
  }
  const otherGallery = await Gallery.findOne(galleryQuery);
  if (otherGallery) {
    console.log(`Cloudinary asset "${cleanPublicId}" is still referenced by Gallery photo (${otherGallery.title}). Skipping Cloudinary deletion.`);
    return false;
  }

  // 3. Check Category documents
  const categoryQuery = {
    $or: [
      { 'image.publicId': cleanPublicId },
      { publicId: cleanPublicId },
    ],
  };
  if (excludeDocId) {
    categoryQuery._id = { $ne: excludeDocId };
  }
  const otherCategory = await Category.findOne(categoryQuery);
  if (otherCategory) {
    console.log(`Cloudinary asset "${cleanPublicId}" is still referenced by Category (${otherCategory.name}). Skipping Cloudinary deletion.`);
    return false;
  }

  // 4. No other record references this publicId, safely delete from Cloudinary
  try {
    const result = await removeFromCloudinary(cleanPublicId);
    console.log(`Safely deleted unreferenced Cloudinary asset: "${cleanPublicId}"`, result);
    return true;
  } catch (err) {
    const errMsg = err.message || String(err);
    if (errMsg.includes('403')) {
      console.warn(`[Cloudinary Warning] Asset deletion for "${cleanPublicId}" returned 403 Forbidden. (Your Cloudinary API key has restricted destroy/delete permissions in Cloudinary Console). Database record removed successfully.`);
    } else {
      console.error(`Error deleting Cloudinary asset "${cleanPublicId}":`, errMsg);
    }
    return false;
  }
};
