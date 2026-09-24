import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, Star, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';

export default function ManageMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/menu?limit=300${search ? `&search=${search}` : ''}`);
      if (res.data.success) setItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish? Its Cloudinary image will also be removed if not referenced elsewhere.')) {
      try {
        const res = await api.delete(`/menu/${id}`);
        if (res.data.success) {
          showToast('Dish and Cloudinary image deleted successfully', 'info');
          fetchItems();
        }
      } catch (err) {
        showToast('Failed to delete dish', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Manage Menu Items</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Add, edit, or remove dishes from the restaurant menu</p>
        </div>
        <Link
          to="/admin/menu/add"
          className="px-5 py-2.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-gold-300 transition-colors shadow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
          />
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-500 text-xs">Loading dishes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-slate-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Dish</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                      <img src={getImageUrl(it.image)} alt={it.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-zinc-900" />
                      <span>{it.name}</span>
                    </td>
                    <td className="p-3 text-burgundy-800 dark:text-gold-400 font-semibold">
                      {typeof it.category === 'object' ? it.category?.name : it.category}
                    </td>
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">₹{it.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        it.isAvailable ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400'
                      }`}>
                        {it.isAvailable ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="p-3">
                      {it.isFeatured && <Sparkles className="w-4 h-4 text-gold-500" />}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/admin/menu/edit/${it._id}`}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-burgundy-800 dark:hover:text-gold-300 inline-block"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(it._id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
