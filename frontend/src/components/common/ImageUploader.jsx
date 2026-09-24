import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getImageUrl, getImagePublicId } from '../../utils/imageUtils';

export default function ImageUploader({
  value,
  onChange,
  label = 'Image Upload',
  type = 'menu', // 'menu' or 'gallery'
  category = '', // Category ID, name, or slug
  className = '',
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Extract current image URL and publicId
  const currentUrl = previewUrl || getImageUrl(value, '');
  const currentPublicId = getImagePublicId(value);

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

  const validateFile = (file) => {
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      const err = 'Invalid file type. Please upload a JPG, PNG, WebP, or AVIF image.';
      setErrorMsg(err);
      showToast(err, 'error');
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const err = `File size exceeds ${MAX_SIZE_MB}MB limit. Please select a smaller file.`;
      setErrorMsg(err);
      showToast(err, 'error');
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      if (category) {
        formData.append('category', category);
      }

      const response = await api.post('/admin/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const uploadedData = {
          url: response.data.url,
          publicId: response.data.publicId,
        };

        // Revoke blob URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl('');

        onChange(uploadedData);
        showToast(`Image uploaded successfully to Cloudinary!`, 'success');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to upload image to Cloudinary';
      setErrorMsg(message);
      showToast(message, 'error');
      setPreviewUrl('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (uploading) return;

    if (currentPublicId) {
      try {
        await api.delete('/admin/upload/image', {
          data: { publicId: currentPublicId },
        });
        showToast('Image removed', 'info');
      } catch (err) {
        console.error('Error deleting Cloudinary image:', err);
      }
    }

    setPreviewUrl('');
    setErrorMsg('');
    onChange({ url: '', publicId: '' });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-zinc-400 font-normal">JPG, PNG, WebP, AVIF (Max {MAX_SIZE_MB}MB)</span>
        </label>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {currentUrl ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 group">
          <img
            src={currentUrl}
            alt="Uploaded Preview"
            className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-lg flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Uploading...' : 'Replace Image'}</span>
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="p-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs transition-colors shadow-lg"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white z-10">
              <RefreshCw className="w-6 h-6 animate-spin text-gold-400" />
              <span className="text-xs font-bold text-gold-400">Uploading to Cloudinary...</span>
            </div>
          )}

          {/* Cloudinary Badge */}
          {currentPublicId && !uploading && (
            <div className="absolute bottom-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md text-gold-400 border border-gold-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Cloudinary Asset</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-gold-500 dark:hover:border-gold-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-900/80 transition-all text-center min-h-[160px] ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <RefreshCw className="w-8 h-8 animate-spin text-gold-400" />
              <span className="text-xs font-bold text-gold-400">Uploading to Cloudinary...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gold-500/10 dark:bg-gold-500/20 border border-gold-500/30 text-gold-500 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Click to select an image for upload
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Supports JPG, JPEG, PNG, WebP or AVIF format up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
