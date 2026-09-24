import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  FolderTree,
  ShoppingBag,
  Calendar,
  Users,
  Star,
  Image as ImageIcon,
  User,
  ArrowLeft,
} from 'lucide-react';

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Menu', path: '/admin/menu', icon: Utensils },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Reservations', path: '/admin/reservations', icon: Calendar },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-gold-500/20 text-zinc-700 dark:text-zinc-300 w-64 p-4 transition-colors">
      <div>
        {/* Brand Header */}
        <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-zinc-950 flex items-center justify-center font-bold">
              SL
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-white leading-tight">Sky Lounge</h2>
              <span className="text-[10px] text-burgundy-800 dark:text-gold-400 font-semibold tracking-wider uppercase block">
                Control Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-burgundy-800 dark:bg-gold-500 text-white dark:text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-zinc-950' : 'text-burgundy-700 dark:text-gold-400/80'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to Public App */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-burgundy-800 dark:hover:text-gold-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
          <span>Back to Restaurant</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-40">{content}</aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
}
