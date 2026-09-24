import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();

  // Profile details state
  const [name, setName] = useState(user?.name || 'Sky Lounge Admin');
  const [phone, setPhone] = useState(user?.phone || '9760999444');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, phone });
    setSavingProfile(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Admin Profile Settings</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Update system administrator contact information and display details</p>
      </div>

      {/* Admin Profile Info Card */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="p-2.5 rounded-2xl bg-gold-500/10 text-gold-500">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Profile Details</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Update admin display name and phone number</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Admin Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Admin Email (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || 'admin@skylounge.com'}
              className="w-full bg-slate-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-xs text-zinc-500 dark:text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-3.5 rounded-xl bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Profile Info</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


