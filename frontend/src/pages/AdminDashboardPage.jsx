import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Utensils,
  TrendingUp,
  ChevronRight,
  Eye,
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-48 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentOrders, recentReservations } = data || {
    stats: {},
    recentOrders: [],
    recentReservations: [],
  };

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: IndianRupee, color: 'text-burgundy-800 dark:text-gold-400' },
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400' },
    { title: "Today's Orders", value: stats.todaysOrders || 0, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Pending Orders', value: stats.pendingOrders || 0, icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
    { title: 'Delivered Orders', value: stats.completedOrders || 0, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
    { title: 'Customers', value: stats.totalUsers || 0, icon: Users, color: 'text-purple-600 dark:text-purple-400' },
    { title: 'Reservations', value: stats.totalReservations || 0, icon: Calendar, color: 'text-pink-600 dark:text-pink-400' },
    { title: 'Menu Dishes', value: stats.totalMenuItems || 0, icon: Utensils, color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Sky Lounge Overview</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Live statistics and recent operational activities</p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{c.title}</span>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-burgundy-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-bold">
              <span>View All</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div key={ord._id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{ord.customerName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">₹{ord.total} • {ord.paymentMethod}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.orderStatus === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400'
                  }`}>
                    {ord.orderStatus}
                  </span>
                  <Link to={`/admin/orders/${ord._id}`} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">Recent Table Bookings</h3>
            <Link to="/admin/reservations" className="text-xs text-burgundy-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-bold">
              <span>View All</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReservations.map((res) => (
              <div key={res._id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{res.name}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{res.numberOfGuests} Guests • {res.date} ({res.time})</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  res.status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400'
                }`}>
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
