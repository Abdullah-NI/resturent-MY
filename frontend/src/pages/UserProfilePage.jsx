import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name,
      phone,
      addresses: [{ street, city: 'Deoband', state: 'Uttar Pradesh', pincode: '247554', isDefault: true }],
    };

    await updateProfile(payload);
    setLoading(false);
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-burgundy-50 dark:bg-gold-500/20 border border-burgundy-200 dark:border-gold-500/40 text-burgundy-800 dark:text-gold-400 font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">{user?.name}</h1>
        <span className="inline-block px-3 py-0.5 rounded-full bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider">
          {user?.role === 'admin' ? 'Administrator' : 'Valued Customer'}
        </span>
      </div>

      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl dark:shadow-2xl">
        <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-burgundy-800 dark:text-gold-400" />
          <span>Edit Account Details</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Full Name (Cannot be changed)</label>
              <input
                type="text"
                required
                disabled
                value={name}
                // onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none focus:border-gold-500"
              />
            </div>

           
            <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
            />
          </div>
          </div>

           <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Email (Cannot be changed)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500"
              />
            </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Default Delivery Address</label>
            <textarea
              rows="2"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Railway Road, Deoband..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
