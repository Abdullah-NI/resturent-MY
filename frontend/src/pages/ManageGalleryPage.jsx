import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ImageUploader from '../components/common/ImageUploader';
import { getImageUrl } from '../utils/imageUtils';

export default function ManageGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [imageData, setImageData] = useState({ url: '', publicId: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery');
      if (res.data.success) setItems(res.data.gallery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageData.url) {
      showToast('Please upload an image for the gallery', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/admin/gallery', {
        title,
        category,
        image: imageData,
        imageUrl: imageData.url,
      });
      if (res.data.success) {
        showToast('Gallery image added!', 'success');
        setTitle('');
        setImageData({ url: '', publicId: '' });
        fetchGallery();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding image', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this gallery photo? Its Cloudinary asset will also be removed.')) {
      try {
        await api.delete(`/admin/gallery/${id}`);
        showToast('Photo removed', 'info');
        fetchGallery();
      } catch (err) {
        showToast('Error deleting photo', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Manage Photo Gallery</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Upload ambience and food photography via Cloudinary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm h-fit">
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
            <span>Add New Photo</span>
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Image Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Paneer Sizzler"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              >
                <option value="Food">Food</option>
                <option value="Ambience">Ambience</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Events">Events</option>
              </select>
            </div>

            {/* Cloudinary Image Uploader */}
            <ImageUploader
              value={imageData}
              onChange={(img) => setImageData(img)}
              label="Gallery Image (Cloudinary)"
              type="gallery"
              category={category}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold"
            >
              {submitting ? 'Saving...' : 'Save Gallery Photo'}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">Gallery Photos ({items.length})</h3>
          {loading ? (
            <div className="text-xs text-zinc-500">Loading gallery...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((img) => {
                const src = getImageUrl(img.image || img.imageUrl);
                return (
                  <div key={img._id} className="relative h-36 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                    <img src={src} alt={img.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center flex-col gap-2">
                      <p className="text-[10px] text-white font-bold">{img.title}</p>
                      <button
                        onClick={() => handleDelete(img._id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Delete photo & Cloudinary asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
