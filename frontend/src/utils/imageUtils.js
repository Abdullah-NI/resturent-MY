/**
  Extracts a valid image URL string from either a string or an object like { url: String, publicId: String }.
  Applies f_auto,q_auto optimization for Cloudinary URLs.
  Returns the fallback URL if the image is missing.
  @param {string|{url?: string}|null|undefined} image
  @param {string} fallback
  @returns {string}
 */
export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

export const optimizeCloudinaryUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return urlStr;
  if (!urlStr.includes('res.cloudinary.com')) return urlStr;
  if (urlStr.includes('/f_auto,q_auto/')) return urlStr;

  return urlStr.replace('/upload/', '/upload/f_auto,q_auto/');
};

export const getImageUrl = (image, fallback = DEFAULT_FALLBACK_IMAGE) => {
  if (!image) return fallback;
  let rawUrl = '';
  if (typeof image === 'string') rawUrl = image.trim();
  else if (typeof image === 'object' && image.url) rawUrl = image.url.trim();

  if (!rawUrl) return fallback;
  return optimizeCloudinaryUrl(rawUrl);
};

/**
  Extracts publicId from an image value (either string or object)
  @param {string|{publicId?: string}|null|undefined} image
  @returns {string}
 */
export const getImagePublicId = (image) => {
  if (!image) return '';
  if (typeof image === 'object' && image.publicId) return image.publicId;
  return '';
};
