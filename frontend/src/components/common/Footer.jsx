import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Phone, Clock, MessageSquare, ExternalLink, Heart } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Sky+Lounge+Restaurant+Deoband+Opposite+Punjab+National+Bank";
  const whatsappUrl = "https://wa.me/919760999444";

  return (
    <footer className="bg-slate-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-gold-500/20 pt-16 pb-8 relative overflow-hidden transition-colors duration-300">
      {/* Subtle Background Glow */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-burgundy-900/10 dark:bg-burgundy-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-zinc-950 font-bold shadow-gold">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-wider text-zinc-900 dark:text-white">
                SKY LOUNGE
              </span>
            </div>
            <p className="text-burgundy-800 dark:text-gold-400 italic text-sm font-serif font-semibold">
              "Where Great Food Meets Great Moments"
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Deoband's premier 100% pure vegetarian multi-cuisine lounge offering authentic Indian starters, Chinese delicacies, Italian pizzas, sizzlers, dosas, and fresh beverages.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/skyloungedbd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-gold-500 hover:border-gold-500/40 transition-all shadow-sm"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              {/* <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-gold-500 hover:border-gold-500/40 transition-all shadow-sm"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white tracking-wide border-l-2 border-burgundy-700 dark:border-gold-500 pl-3">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  About Sky Lounge
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Area */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white tracking-wide border-l-2 border-burgundy-700 dark:border-gold-500 pl-3">
              Customer Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/profile" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/my-reservations" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link to="/order-tracking" className="text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors">
                  Track Live Order
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-burgundy-800 dark:text-gold-400 hover:underline transition-colors font-semibold">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Contact Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white tracking-wide border-l-2 border-burgundy-700 dark:border-gold-500 pl-3">
              Contact & Hours
            </h3>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0 mt-0.5" />
                <span>
                  2nd Floor, Opposite Punjab National Bank, Railway Road, Teachers Colony, Deoband - 247554, Uttar Pradesh
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Phone className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0" />
                <a href="tel:9760999444" className="hover:text-burgundy-800 dark:hover:text-gold-400 transition-colors font-semibold">
                  +91 9760999444
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Clock className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0" />
                <span>Every day: 12:00 PM - 10:30 PM</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 rounded-full hover:brightness-110 shadow-gold transition-all"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Sky Lounge Restaurant. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-burgundy-600 fill-burgundy-600 inline" />
            <span>for Premium Vegetarian Dining in Deoband</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
