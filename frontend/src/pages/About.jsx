import React from 'react';
import { Sparkles, ShieldCheck, Heart, UtensilsCrossed, Clock, MapPin, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About Sky Lounge</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
          Where Passion Meets Culinary Excellence
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          Established in Deoband, Sky Lounge Restaurant has redefined pure vegetarian dining with luxury ambience, fresh ingredients, and exceptional hospitality.
        </p>
      </div>

      {/* Grid Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white leading-snug">
            Our Mission: Delivering Pure, Delicious & Memorable Dining Moments
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
            At Sky Lounge, we believe that food is not merely sustenance — it is an art of bringing friends, families, and communities together. Located on the 2nd Floor opposite Punjab National Bank on Railway Road, our restaurant offers a cozy, air-conditioned lounge environment designed for family dinners, celebrations, and casual hangouts.
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
            Our 100% pure vegetarian kitchen strictly maintains traditional hygiene standards while crafting over 250 delicacies ranging from North Indian Paneer favorites and Chinese noodles to Italian pizzas and mocktail drinks.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/20 shadow-md dark:shadow-none">
              <span className="font-heading text-3xl font-extrabold text-burgundy-800 dark:text-gold-400 block">250+</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Pure Veg Dishes</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/20 shadow-md dark:shadow-none">
              <span className="font-heading text-3xl font-extrabold text-burgundy-800 dark:text-gold-400 block">100%</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Hygiene & Quality</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-gold-500/30 shadow-xl h-96">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000"
            alt="Sky Lounge Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
