import React from 'react';
import { Menu as MenuIcon, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AdminNavbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-gold-500/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <span className="text-xs text-burgundy-800 dark:text-gold-400 font-semibold uppercase tracking-wider hidden sm:inline">
          Sky Lounge Operations Hub
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-burgundy-800" />}
        </button>

        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-zinc-900 dark:text-white">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-burgundy-800 dark:text-gold-400 font-semibold">System Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-burgundy-800 text-white dark:bg-gold-500/20 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
