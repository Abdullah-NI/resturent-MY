import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Sparkles,
  Calendar,
  Phone,
  ShieldCheck,
  Award,
  Truck,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  Heart,
  MessageSquare,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/common/FoodCard';
import QuickViewModal from '../components/common/QuickViewModal';
import ReviewsModal from '../components/common/ReviewsModal';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { getImageUrl } from '../utils/imageUtils';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedQuickView, setSelectedQuickView] = useState(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const reviewRes = await api.get('/reviews?limit=3');
      if (reviewRes.data.success) {
        setReviews(reviewRes.data.reviews.slice(0, 3));
        setTotalReviewsCount(reviewRes.data.totalReviews || reviewRes.data.reviews.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get('/menu?isFeatured=true&limit=6'),
          api.get('/categories/popular'),
        ]);

        if (menuRes.data.success) setFeaturedItems(menuRes.data.items);
        if (catRes.data.success) setCategories(catRes.data.categories);
        await fetchReviews();
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
        {/* Background Image with Translucent Light / Deep Dark Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1760608764309-b3f97ab951e2?auto=format&fit=crop&q=80&w=2000"
            alt="Sky Lounge Ambience"
            className="w-full h-full object-cover scale-105 filter brightness-95 dark:brightness-50 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-white/85 to-amber-50/70 dark:from-zinc-950 dark:via-zinc-950/75 dark:to-zinc-950/50 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 dark:from-gold-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-burgundy-200 dark:border-gold-500/40 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-md dark:shadow-gold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deoband's Premier 100% Pure Veg Lounge</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-wider leading-tight drop-shadow-sm dark:drop-shadow-2xl"
          >
            SKY LOUNGE
            <span className="block font-serif italic text-3xl sm:text-5xl font-normal text-burgundy-800 dark:text-gold-400 mt-2">
              Restaurant
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-xl text-zinc-700 dark:text-zinc-300 font-sans max-w-2xl mx-auto leading-relaxed font-medium dark:font-normal"
          >
            "Where Great Food Meets Great Moments" — Savor authentic North Indian, Chinese, Italian, Sizzling Kebabs, and Refreshing Mocktails.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/menu"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-gold transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Menu</span>
            </Link>

            <Link
              to="/menu"
              className="px-8 py-3.5 rounded-full bg-burgundy-800 text-white border border-burgundy-600 font-bold text-sm hover:bg-burgundy-700 shadow-burgundy transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Order Home Delivery</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              to="/reservation"
              className="px-8 py-3.5 rounded-full bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-gold-300 border border-zinc-200 dark:border-gold-500/40 font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-burgundy-800 dark:hover:text-white transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shadow-sm dark:shadow-none"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve a Table</span>
            </Link>
          </motion.div>

          {/* Quick Info Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-700 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 max-w-xl mx-auto font-medium dark:font-normal">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
              <span>2nd Floor, Opp PNB, Railway Road</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
              <span>Free Delivery: 9760999444</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTRODUCTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>An Unmatched Culinary Experience</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
              Welcome to Deoband's Favorite Multi-Cuisine Sanctuary
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              Located on the 2nd Floor opposite Punjab National Bank on Railway Road, Sky Lounge Restaurant offers an exquisite dining environment paired with an extensive menu crafted by master chefs. From sizzling Paneer Tikkas and authentic Chinese Manchurian to fresh South Indian Dosas and creamy Italian pastas, every dish is prepared with 100% vegetarian love.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">100% Pure Veg</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Strictly vegetarian kitchen</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                <Truck className="w-6 h-6 text-burgundy-800 dark:text-gold-400" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Express Delivery</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Hot food to your door</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-gold-500/30 group h-80 lg:h-96">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000"
              alt="Restaurant Dining Area"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-gold-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Open Daily</p>
                <p className="text-[11px] text-gold-400">12:00 PM – 10:30 PM</p>
              </div>
              <Link
                to="/reservation"
                className="text-xs font-bold text-zinc-950 bg-gold-400 hover:bg-gold-300 px-3.5 py-1.5 rounded-full transition-colors"
              >
                Book Table
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-xs text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-widest">Handpicked Favorites</span>
            <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white mt-1">Featured Signature Dishes</h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-burgundy-800 dark:text-gold-400 hover:text-burgundy-700 dark:hover:text-gold-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <FoodCard key={item._id} item={item} onQuickView={setSelectedQuickView} />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR CATEGORIES */}
      {(loading || categories.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-widest">Taste the Variety</span>
            <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Popular Menu Categories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/menu?category=${cat.slug}`}
                className="group relative h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-gold-500/20 hover:border-burgundy-700 dark:hover:border-gold-500/60 shadow-md dark:shadow-xl transition-all"
              >
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-zinc-950 via-black/40 dark:via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-zinc-300 dark:text-zinc-400 group-hover:text-gold-400 transition-colors flex items-center gap-1">
                    Explore dishes <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. WHY CHOOSE SKY LOUNGE */}
      <section className="bg-slate-100 dark:bg-zinc-900/60 py-16 border-y border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-widest">Our Promise</span>
            <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Why Dine With Sky Lounge?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold-500/20 space-y-4 hover:border-burgundy-700 dark:hover:border-gold-500/50 shadow-md dark:shadow-none transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">100% Pure Vegetarian</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Dedicated vegetarian kitchen ensuring absolute purity, hygiene, and authentic flavors in every dish.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold-500/20 space-y-4 hover:border-burgundy-700 dark:hover:border-gold-500/50 shadow-md dark:shadow-none transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">Master Culinary Chefs</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Crafted by experienced chefs using fresh cottage cheese, fragrant spices, and premium mocktail syrups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold-500/20 space-y-4 hover:border-burgundy-700 dark:hover:border-gold-500/50 shadow-md dark:shadow-none transition-all">
              <div className="w-12 h-12 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">Fast Home Delivery</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Call or WhatsApp 9760999444 to receive steaming hot meals directly at your doorstep anywhere in Deoband.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS (Max 3 on Home + View More & Write Review buttons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-widest">Guest Experiences</span>
            <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white mt-1">What Our Guests Say</h2>
          </div>

          <button
            onClick={() => setReviewsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 border border-burgundy-200 dark:border-gold-500/30 font-bold text-xs hover:bg-burgundy-100 dark:hover:bg-gold-500/20 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-gold-500" />
            <span>Write a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div key={rev._id} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-md dark:shadow-none hover:border-gold-500/30 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500 dark:text-gold-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'fill-amber-500 text-amber-500 dark:fill-gold-400 dark:text-gold-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">"{rev.comment}"</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">{rev.name}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                  Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View More Reviews Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setReviewsModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/40 text-zinc-900 dark:text-white font-bold text-xs hover:border-gold-500 hover:text-burgundy-800 dark:hover:text-gold-400 shadow-md dark:shadow-none transition-all"
          >
            <span>View More Reviews ({totalReviewsCount})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. RESERVATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-white via-zinc-50 to-rose-50 dark:from-burgundy-900 dark:via-zinc-950 dark:to-burgundy-950 border border-gold-500/30 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
            Plan an Unforgettable Family Dining Experience
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-2xl mx-auto">
            Reserving a table in advance guarantees comfortable seating for your family, birthday celebrations, or group gatherings.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/reservation"
              className="px-8 py-3.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-sm hover:bg-gold-300 shadow-gold transition-all"
            >
              Book Table Online
            </Link>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedQuickView && (
        <QuickViewModal item={selectedQuickView} onClose={() => setSelectedQuickView(null)} />
      )}

      {/* Customer Reviews Showcase & Submission Modal */}
      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
}
