import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, Sparkles } from 'lucide-react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const url = selectedCategory ? `/gallery?category=${selectedCategory}` : '/gallery';
        const res = await api.get(url);
        if (res.data.success) setItems(res.data.gallery);
      } catch (error) {
        console.error('Failed to load gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  const categories = ['Food', 'Ambience', 'Restaurant', 'Events'];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visual Showcase</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
          Sky Lounge Gallery
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Glimpse into our dining ambience, freshly prepared dishes, and memorable moments.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-2.5 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            !selectedCategory
              ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 shadow-gold'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          All Photos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 shadow-gold'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              onClick={() => setLightboxImage(item)}
              className="relative h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 cursor-pointer group shadow-md dark:shadow-xl"
            >
              <img
                src={getImageUrl(item.image || item.imageUrl)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="font-heading text-lg font-bold text-white">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-950/80 text-white flex items-center justify-center border border-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={getImageUrl(lightboxImage.image || lightboxImage.imageUrl)} alt={lightboxImage.title} className="w-full max-h-[75vh] object-contain bg-zinc-950" />
              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">{lightboxImage.title}</h3>
                <span className="text-xs text-burgundy-800 dark:text-gold-400 font-semibold">{lightboxImage.category}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
