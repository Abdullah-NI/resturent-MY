import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
  Uploads a buffer stream to Cloudinary into a specified folder
  Supports signed stream upload and unsigned preset stream upload
  @param {Buffer} buffer - File buffer
  @param {string} folder - Folder name in Cloudinary (default: 'skylounge')
  @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (buffer, folder = 'skylounge') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return reject(new Error('Cloudinary credentials are not configured in backend .env file.'));
    }

    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // Response handler
    const handleResponse = (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
      });
    };

    if (preset) {
      // If preset is configured, attempt unsigned upload stream first (bypasses API Key restricted permissions)
      const stream = cloudinary.uploader.unsigned_upload_stream(
        preset,
        { folder, resource_type: 'auto' },
        (err, result) => {
          if (err) {
            // Fall back to signed upload stream with preset if unsigned fails
            const signedStream = cloudinary.uploader.upload_stream(
              { folder, upload_preset: preset, resource_type: 'auto' },
              handleResponse
            );
            signedStream.end(buffer);
          } else {
            handleResponse(null, result);
          }
        }
      );
      stream.end(buffer);
    } else {
      // Standard signed upload stream
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        handleResponse
      );
      stream.end(buffer);
    }
  });
};

/**
  Deletes an image from Cloudinary by its public ID
  @param {string} publicId - The Cloudinary public_id
  @returns {Promise<any>}
 */
export const removeFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials missing when attempting to remove asset:', publicId);
    return null;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error removing asset from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
