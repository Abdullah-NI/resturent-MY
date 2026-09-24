import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUtils';

export default function QuickViewModal({ item, onClose }) {
  const { addToCart } = useCart();
  const isSoldOut = item?.isAvailable === false;
  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState(
    item?.priceOptions?.length > 0 ? item.priceOptions[0].portion : ''
  );

  if (!item) return null;

  const currentPrice = selectedPortion && item.priceOptions?.length
    ? item.priceOptions.find((p) => p.portion === selectedPortion)?.price || item.price
    : item.price;

  const handleAdd = () => {
    if (isSoldOut) return;
    const res = addToCart(item, quantity, selectedPortion);
    if (res !== false) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl text-zinc-800 dark:text-zinc-200 grid grid-cols-1 md:grid-cols-2"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="relative h-64 md:h-full bg-slate-100 dark:bg-zinc-950">
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className={`w-full h-full object-cover ${isSoldOut ? 'grayscale-[30%] opacity-80' : ''}`}
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="bg-red-600/90 text-white font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-red-400/40 shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  100% Pure Veg
                </span>
                {isSoldOut && (
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Sold Out
                  </span>
                )}
                {item.isPopular && !isSoldOut && (
                  <span className="bg-gold-500/90 text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-zinc-950" />
                    Popular
                  </span>
                )}
                <span className="text-xs text-burgundy-800 dark:text-gold-400 font-semibold uppercase tracking-wider">
                  {typeof item.category === 'object' ? item.category?.name : item.category}
                </span>
              </div>

              <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">{item.name}</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.description || 'Prepared fresh with high quality ingredients and traditional Sky Lounge spices.'}
              </p>

              <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-burgundy-800 dark:text-gold-400" />
                  <span>Prep: {item.preparationTime || '15-20 min'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Hygiene Guaranteed</span>
                </div>
              </div>

              {item.priceOptions?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Portion:</label>
                  <div className="flex flex-wrap gap-2">
                    {item.priceOptions.map((opt) => (
                      <button
                        key={opt.portion}
                        disabled={isSoldOut}
                        onClick={() => !isSoldOut && setSelectedPortion(opt.portion)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          isSoldOut
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                            : selectedPortion === opt.portion
                            ? 'bg-burgundy-800 dark:bg-gold-500 text-white dark:text-zinc-950 border-burgundy-700 dark:border-gold-400 font-bold'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                      >
                        {opt.portion} — ₹{opt.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total Price</span>
                  <span className="font-heading text-2xl font-bold text-burgundy-800 dark:text-gold-400">
                    ₹{currentPrice * quantity}
                  </span>
                </div>

                {!isSoldOut && (
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1.5 gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white min-w-[20px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="text-burgundy-800 dark:text-gold-400 hover:text-burgundy-700 dark:hover:text-gold-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isSoldOut ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold text-sm cursor-not-allowed border border-zinc-300 dark:border-zinc-700 select-none text-center"
                >
                  Item Currently Sold Out
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-gold transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add {quantity} to Order • ₹{currentPrice * quantity}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
