import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Eye, Sparkles, Clock, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';

import { getImageUrl } from '../../utils/imageUtils';

export default function FoodCard({ item, onQuickView }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const isSoldOut = item.isAvailable === false;
  const [selectedPortion, setSelectedPortion] = useState(
    item.priceOptions && item.priceOptions.length > 0 ? item.priceOptions[0].portion : ''
  );

  const cartKey = `${item._id}-${selectedPortion}`;
  const existingCartItem = cartItems.find((i) => i.cartKey === cartKey);
  const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;

  const currentPrice = selectedPortion && item.priceOptions?.length
    ? item.priceOptions.find((p) => p.portion === selectedPortion)?.price || item.price
    : item.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={isSoldOut ? {} : { y: -6 }}
      className={`bg-white dark:bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-200 dark:border-gold-500/20 hover:border-burgundy-700/40 dark:hover:border-gold-500/50 shadow-md shadow-zinc-200/60 dark:shadow-xl hover:shadow-2xl hover:shadow-burgundy-900/10 dark:hover:shadow-gold-500/10 transition-all flex flex-col group relative ${
        isSoldOut ? 'opacity-70 grayscale-[20%] cursor-not-allowed' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-zinc-950">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          className={`w-full h-full object-cover ${isSoldOut ? '' : 'group-hover:scale-110'} transition-transform duration-500`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-zinc-950 via-transparent to-transparent opacity-80" />

        {/* Sold Out Overlay Badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-600/90 text-white font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-red-400/40 shadow-lg shadow-red-950/50">
              Sold Out
            </span>
          </div>
        )}

        {/* Veg Badge & Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-emerald-900/90 dark:bg-emerald-950/90 text-emerald-300 dark:text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Veg
          </span>
          {item.isPopular && (
            <span className="bg-gold-500/90 text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-zinc-950" />
              Popular
            </span>
          )}
        </div>

        {/* Quick View Button Overlay (Disabled when Sold Out) */}
        {!isSoldOut && (
          <button
            onClick={() => onQuickView && onQuickView(item)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:text-burgundy-800 dark:hover:text-gold-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
            aria-label="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Category Tag at Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300 dark:text-zinc-400 z-10">
          <span className="font-bold text-gold-300 dark:text-gold-400 uppercase tracking-widest text-[10px]">
            {typeof item.category === 'object' ? item.category?.name : item.category}
          </span>
          <span className="flex items-center gap-1 text-[10px]">
            <Clock className="w-3 h-3" />
            {item.preparationTime || '15-20 min'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white group-hover:text-burgundy-800 dark:group-hover:text-gold-300 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-2 mt-1 leading-relaxed">
            {item.description || 'Prepared fresh with high quality ingredients and traditional Sky Lounge spices.'}
          </p>
        </div>

        {/* Portion Selector if multiple options */}
        {item.priceOptions && item.priceOptions.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Portion:</span>
            <div className="flex gap-1">
              {item.priceOptions.map((opt) => (
                <button
                  key={opt.portion}
                  disabled={isSoldOut}
                  onClick={() => !isSoldOut && setSelectedPortion(opt.portion)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                    isSoldOut
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                      : selectedPortion === opt.portion
                      ? 'bg-burgundy-800 dark:bg-gold-500 text-white dark:text-zinc-950 border-burgundy-700 dark:border-gold-400 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {opt.portion} (₹{opt.price})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Add to Cart Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-sans">Price</span>
            <span className="font-heading text-xl font-bold text-burgundy-800 dark:text-gold-400">
              ₹{currentPrice}
            </span>
          </div>

          {isSoldOut ? (
            <button
              disabled
              className="px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold text-xs cursor-not-allowed border border-zinc-300 dark:border-zinc-700 select-none"
            >
              Sold Out
            </button>
          ) : currentQuantity > 0 ? (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-burgundy-700/30 dark:border-gold-500/40 rounded-full px-2 py-1 gap-2">
              <button
                onClick={() => updateQuantity(cartKey, -1)}
                className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white flex items-center justify-center text-xs transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-zinc-900 dark:text-white min-w-[16px] text-center">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(cartKey, 1)}
                className="w-6 h-6 rounded-full bg-gold-500 hover:bg-gold-400 text-zinc-950 flex items-center justify-center text-xs transition-colors font-bold"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, 1, selectedPortion)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
