import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ImageUploader from '../components/common/ImageUploader';

export default function EditMenuItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: { url: '', publicId: '' },
    preparationTime: '15-20 mins',
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/menu/${id}`),
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (itemRes.data.success) {
          const item = itemRes.data.item;
          setFormData({
            name: item.name || '',
            description: item.description || '',
            price: item.price || '',
            category: typeof item.category === 'object' ? item.category?._id : item.category,
            image: typeof item.image === 'object' ? item.image : { url: item.image || '', publicId: '' },
            preparationTime: item.preparationTime || '15-20 mins',
            isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
            isPopular: item.isPopular !== undefined ? item.isPopular : false,
            isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,
          });
        }
      } catch (err) {
        showToast('Failed to load dish details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/menu/${id}`, {
        ...formData,
        price: Number(formData.price),
      });
      if (res.data.success) {
        showToast('Dish updated successfully!', 'success');
        navigate('/admin/menu');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Loading dish data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Edit Dish Details</h1>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Preparation Time</label>
              <input
                type="text"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Cloudinary Image Uploader */}
          <ImageUploader
            value={formData.image}
            onChange={(imgObj) => setFormData({ ...formData, image: imgObj })}
            label="Dish Image (Cloudinary)"
            type="menu"
            category={formData.category}
          />

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Short Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="accent-gold-500"
              />
              <span>Available for ordering</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="accent-gold-500"
              />
              <span>Is Popular</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="accent-gold-500"
              />
              <span>Feature on Home Showcase</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Update Dish'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
