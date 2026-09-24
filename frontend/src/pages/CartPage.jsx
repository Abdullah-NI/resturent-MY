import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Your Cart is Empty</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto">
          Explore our delicious 100% Pure Vegetarian menu and add your favorite dishes to get started!
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 shadow-gold transition-all"
        >
          <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
          <span>Browse Sky Lounge Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Your Food Basket</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{cartItems.length} dish types selected</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartKey}
              className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-gold-500/30 transition-all shadow-md dark:shadow-none"
            >
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-zinc-950"
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-white truncate">{item.name}</h3>
                {item.portion && (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Portion: {item.portion}</span>
                )}
                <span className="text-sm font-bold text-burgundy-800 dark:text-gold-400 mt-1 block">
                  ₹{item.price} each
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full px-2.5 py-1 gap-2">
                  <button
                    onClick={() => updateQuantity(item.cartKey, -1)}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white min-w-[16px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartKey, 1)}
                    className="text-burgundy-800 dark:text-gold-400 hover:text-burgundy-700 dark:hover:text-gold-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartKey)}
                  className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-6 space-y-6 shadow-xl dark:shadow-2xl h-fit">
          <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-900 dark:text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Delivery Fee</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {subtotal < 500 && (
              <p className="text-[11px] text-burgundy-800 dark:text-gold-400/90 italic font-medium">
                {/* Add ₹{500 - subtotal} more for FREE home delivery! */}
              </p>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between text-base font-bold text-zinc-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-burgundy-800 dark:text-gold-400 font-heading text-xl">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
