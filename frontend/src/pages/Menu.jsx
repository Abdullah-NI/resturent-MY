import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Sparkles, X, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/common/FoodCard';
import QuickViewModal from '../components/common/QuickViewModal';
import Pagination from '../components/common/Pagination';
import { CardSkeleton, CategorySkeleton } from '../components/common/SkeletonLoader';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuickView, setSelectedQuickView] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const menuGridRef = useRef(null);
  const ITEMS_PER_PAGE = 9;

  // Filters
  const activeCategory = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [priceFilter, setPriceFilter] = useState(400);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Reset pagination to page 1 whenever category, search, price, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, priceFilter, sortOption]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        let url = `/menu?page=${currentPage}&limit=${ITEMS_PER_PAGE}&maxPrice=${priceFilter}`;
        if (activeCategory) url += `&category=${activeCategory}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (sortOption !== 'default') url += `&sort=${sortOption}`;

        const res = await api.get(url);
        if (res.data.success) {
          setItems(res.data.items);
          setTotalPages(res.data.pages || 1);
          setTotalItems(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchMenuItems, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, sortOption, priceFilter, currentPage]);

  const handleCategorySelect = (slug) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (menuGridRef.current) {
      menuGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Original Sky Lounge Menu</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
          Explore Our Authentic Dishes
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          100% Pure Vegetarian multi-cuisine menu featuring fresh starters, sizzlers, authentic Chinese, Italian pizzas, dosas, and desserts.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Filter By Category:</h3>
        {categories.length === 0 ? (
          <CategorySkeleton />
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !activeCategory
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 shadow-gold'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 shadow-gold'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md dark:shadow-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish (e.g. Paneer Tikka)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Price Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Price Range Slider */}
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Max Price:</span>
            <input
              type="range"
              min="30"
              max="400"
              step="10"
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
              className="accent-gold-500 cursor-pointer w-24 sm:w-32"
            />
            <span className="font-bold text-burgundy-800 dark:text-gold-400">₹{priceFilter}</span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-burgundy-800 dark:text-gold-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid Section */}
      <div ref={menuGridRef} className="scroll-mt-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No Dishes Found</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              We couldn't find any dishes matching your selected filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setSearchQuery('');
                setPriceFilter(400);
              }}
              className="px-6 py-2.5 rounded-full bg-gold-500 text-zinc-950 font-bold text-xs hover:bg-gold-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="wait">
                {items.map((item) => (
                  <FoodCard key={item._id} item={item} onQuickView={setSelectedQuickView} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedQuickView && (
        <QuickViewModal item={selectedQuickView} onClose={() => setSelectedQuickView(null)} />
      )}
    </div>
  );
}
