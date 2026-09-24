import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center font-bold text-3xl shadow-gold">
        404
      </div>
      <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
        Dish or Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
        The page you are looking for might have been moved or does not exist on Sky Lounge Restaurant servers.
      </p>
      <Link
        to="/"
        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
