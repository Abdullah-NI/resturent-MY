import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Phone, Menu as MenuIcon, X, LogOut, UtensilsCrossed, Calendar, ChevronDown, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reservation', path: '/reservation' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-gold-500/20 py-3 shadow-md dark:shadow-2xl'
          : 'bg-gradient-to-b from-white/90 dark:from-zinc-950/90 via-white/60 dark:via-zinc-950/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-zinc-950 shadow-gold group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-heading text-xl md:text-2xl font-bold tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              SKY LOUNGE
              {/* <span className="text-[10px] uppercase font-sans tracking-widest bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                100% Veg
              </span> */}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-gold-400 tracking-[0.2em] uppercase block -mt-1 font-medium">
              Restaurant • Deoband
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                  isActive
                    ? 'text-burgundy-800 dark:text-gold-400 font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-burgundy-700 dark:hover:text-gold-300'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-burgundy-700 dark:from-gold-400 to-gold-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all"
            aria-label="Toggle Light/Dark Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-burgundy-800" />}
          </button>

          {/* Quick Call Button */}
          <a
            href="tel:9760999444"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-burgundy-800 dark:text-gold-400 bg-burgundy-50 dark:bg-gold-500/10 hover:bg-burgundy-100 dark:hover:bg-gold-500/20 border border-burgundy-200 dark:border-gold-500/30 px-3 py-2 rounded-full transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>9760999444</span>
          </a>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full text-zinc-700 dark:text-zinc-200 hover:text-burgundy-800 dark:hover:text-gold-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/40"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy-700 dark:bg-burgundy-700 text-white dark:text-gold-300 font-bold text-xs rounded-full flex items-center justify-center border border-gold-500/50 shadow-md"
              >
                {totalCount}
              </motion.span>
            )}
          </Link>

          {/* User Account / Admin Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 text-zinc-900 dark:text-white hover:border-gold-500 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-burgundy-800 text-white dark:bg-gold-500/20 dark:text-gold-400 flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium max-w-[90px] truncate hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl text-zinc-800 dark:text-zinc-200"
                  >
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-burgundy-800 dark:text-gold-400 hover:bg-zinc-100 dark:hover:bg-gold-500/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/my-reservations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      My Reservations
                    </Link>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 hover:brightness-110 shadow-gold transition-all"
            >
              Login / Register
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-gold-500/20 backdrop-blur-xl px-4 pt-4 pb-6 overflow-hidden"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 font-bold border-l-2 border-burgundy-700 dark:border-gold-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 pt-3 flex flex-col gap-2">
                <a
                  href="tel:9760999444"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 font-semibold border border-burgundy-200 dark:border-gold-500/30 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Call: 9760999444
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
