import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Eye,
  RefreshCw,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ManageOrdersPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'userHistory'

  // Tab 1: All Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);

  // Tab 2: User Order History Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // { _id, name, email, phone }

  // User History Filters & Results
  const [historyOrders, setHistoryOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [userInfo, setUserInfo] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFilteredOrders, setTotalFilteredOrders] = useState(0);

  // Fetch all orders for Tab 1
  const fetchAllOrders = async () => {
    setLoadingAll(true);
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) setAllOrders(res.data.orders);
    } catch (err) {
      console.error(err);
      showToast('Failed to load all orders', 'error');
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Live user search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) {
          setUserSuggestions(res.data.users);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch specific user order history
  const fetchUserOrderHistory = async (targetUser = selectedUser, pageNum = page) => {
    const searchTarget = targetUser || searchQuery.trim();
    if (!searchTarget) return;

    setLoadingHistory(true);
    try {
      let url = `/admin/user-orders?page=${pageNum}&limit=5&t=${Date.now()}`;
      if (typeof searchTarget === 'object' && searchTarget?._id) {
        url += `&userId=${searchTarget._id}`;
      } else if (typeof searchTarget === 'object' && (searchTarget?.phone || searchTarget?.name)) {
        url += `&search=${encodeURIComponent(searchTarget.phone || searchTarget.name)}`;
      } else if (typeof searchTarget === 'string' && searchTarget.trim()) {
        url += `&search=${encodeURIComponent(searchTarget.trim())}`;
      }

      if (statusFilter && statusFilter !== 'All') {
        url += `&orderStatus=${encodeURIComponent(statusFilter)}`;
      }
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      if (res.data.success) {
        setUserInfo(res.data.user);
        setUserStats(res.data.stats);
        setHistoryOrders(res.data.orders);
        setTotalPages(res.data.pagination.totalPages);
        setTotalFilteredOrders(res.data.pagination.totalFilteredOrders);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'No orders found matching search', 'error');
      setHistoryOrders([]);
      setUserInfo(null);
      setUserStats({ totalOrders: 0, totalSpent: 0 });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Trigger search when filters or page change
  useEffect(() => {
    if (activeTab === 'userHistory' && (selectedUser || searchQuery.trim())) {
      fetchUserOrderHistory(selectedUser || searchQuery.trim(), page);
    }
  }, [statusFilter, startDate, endDate, page]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email || user.phone);
    setShowSuggestions(false);
    setPage(1);
    fetchUserOrderHistory(user, 1);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    setPage(1);
    fetchUserOrderHistory(selectedUser || searchQuery.trim(), 1);
  };

  const handleStatusChange = async (id, status) => {
    // Instant optimistic UI update
    setAllOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, orderStatus: status } : ord))
    );
    setHistoryOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, orderStatus: status } : ord))
    );

    try {
      const res = await api.patch(`/admin/orders/${id}/status`, { orderStatus: status });
      if (res.data.success) {
        showToast(`Order status updated to ${status}`, 'success');

        if (res.data.order) {
          const updatedOrd = res.data.order;
          setAllOrders((prev) =>
            prev.map((ord) => (ord._id === id ? { ...ord, ...updatedOrd } : ord))
          );
          setHistoryOrders((prev) =>
            prev.map((ord) => (ord._id === id ? { ...ord, ...updatedOrd } : ord))
          );
        }

        fetchAllOrders();
        if (selectedUser || searchQuery.trim()) {
          fetchUserOrderHistory(selectedUser || searchQuery.trim(), page);
        }
      }
    } catch (err) {
      showToast('Status update failed', 'error');
      fetchAllOrders();
      if (selectedUser || searchQuery.trim()) {
        fetchUserOrderHistory(selectedUser || searchQuery.trim(), page);
      }
    }
  };

  const handlePaymentStatusChange = async (id, status) => {
    // Instant optimistic UI update
    setAllOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, paymentStatus: status } : ord))
    );
    setHistoryOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, paymentStatus: status } : ord))
    );

    try {
      const res = await api.patch(`/admin/orders/${id}/status`, { paymentStatus: status });
      if (res.data.success) {
        showToast(`Payment status updated to ${status}`, 'success');

        if (res.data.order) {
          const updatedOrd = res.data.order;
          setAllOrders((prev) =>
            prev.map((ord) => (ord._id === id ? { ...ord, ...updatedOrd } : ord))
          );
          setHistoryOrders((prev) =>
            prev.map((ord) => (ord._id === id ? { ...ord, ...updatedOrd } : ord))
          );
        }

        fetchAllOrders();
        if (selectedUser || searchQuery.trim()) {
          fetchUserOrderHistory(selectedUser || searchQuery.trim(), page);
        }
      }
    } catch (err) {
      showToast('Payment status update failed', 'error');
      fetchAllOrders();
      if (selectedUser || searchQuery.trim()) {
        fetchUserOrderHistory(selectedUser || searchQuery.trim(), page);
      }
    }
  };

  const resetUserSearchFilters = () => {
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setUserSuggestions([]);
    setUserInfo(null);
    setHistoryOrders([]);
    setUserStats({ totalOrders: 0, totalSpent: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Manage Customer Orders</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Track all restaurant orders or search complete user order history</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-gold-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Orders ({allOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('userHistory')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'userHistory'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-gold-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Search User Orders
          </button>
        </div>
      </div>

      {/* TAB 1: ALL ORDERS TABLE */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={fetchAllOrders}
              className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 text-xs shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
            {loadingAll ? (
              <div className="text-xs text-zinc-500 text-center py-12">Loading orders...</div>
            ) : allOrders.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-12">No customer orders placed yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                  <thead className="bg-slate-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment Status</th>
                      <th className="p-3">Order Status</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {allOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                        <td className="p-3 font-mono font-bold text-burgundy-800 dark:text-gold-400">
                          {ord.orderNumber || `#${ord._id.slice(-6)}`}
                        </td>
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{ord.customerName}</td>
                        <td className="p-3 text-zinc-500 dark:text-zinc-400">{ord.phone}</td>
                        <td className="p-3 text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">₹{ord.total}</td>
                        <td className="p-3">
                          <select
                            value={ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
                            onChange={(e) => handlePaymentStatusChange(ord._id, e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-gold-500 ${
                              ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/admin/orders/${ord._id}`}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEARCH USER ORDERS */}
      {activeTab === 'userHistory' && (
        <div className="space-y-6">
          {/* User Search Bar */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 relative">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-burgundy-800 dark:text-gold-400" />
              <span>Search Customer Account</span>
            </h3>

            <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) clearSelectedUser();
                  }}
                  onFocus={() => userSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search by Name, Email, or Phone Number..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSelectedUser}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all"
              >
                Search User
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && userSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {userSuggestions.map((u, idx) => (
                    <div
                      key={u._id || `guest-${idx}`}
                      onClick={() => handleSelectUser(u)}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-semibold ${
                              u.isRegistered
                                ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {u.isRegistered ? 'Registered User' : 'Guest'}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                          {u.email && <span>{u.email}</span>}
                          {u.phone && <span>• {u.phone}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* User Profile Info & Order History Display */}
          {userInfo && (
            <div className="space-y-6">
              {/* User Info & Order Statistics Card */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-burgundy-50 dark:bg-gold-500/20 border border-burgundy-200 dark:border-gold-500/40 text-burgundy-800 dark:text-gold-400 font-bold text-xl flex items-center justify-center shadow-sm">
                      {userInfo.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">{userInfo.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 text-[10px] font-bold uppercase tracking-wider">
                          {userInfo.isRegistered ? 'Registered Customer' : 'Guest Account'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-burgundy-800 dark:text-gold-400" />
                          {userInfo.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-burgundy-800 dark:text-gold-400" />
                          {userInfo.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall User Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Total Orders Placed</span>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{userStats.totalOrders}</div>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-burgundy-800 dark:text-gold-400 opacity-80" />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Total Revenue Spent</span>
                      <div className="text-2xl font-bold text-gold-500 mt-1">₹{userStats.totalSpent.toLocaleString('en-IN')}</div>
                    </div>
                    <IndianRupee className="w-8 h-8 text-gold-400 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Order Status & Date Range Filters */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-white">
                    <Filter className="w-4 h-4 text-burgundy-800 dark:text-gold-400" />
                    <span>Filter Order History</span>
                  </div>

                  <button
                    onClick={resetUserSearchFilters}
                    className="text-xs text-burgundy-800 dark:text-gold-400 hover:underline flex items-center gap-1 self-end md:self-auto"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Order Status Filter */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Order Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Complete List of Orders for Selected User */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">
                    User Orders ({totalFilteredOrders})
                  </h3>
                  {loadingHistory && <span className="text-xs text-zinc-400">Updating orders...</span>}
                </div>

                {loadingHistory && historyOrders.length === 0 ? (
                  <div className="text-xs text-zinc-500 text-center py-12">Loading user order history...</div>
                ) : historyOrders.length === 0 ? (
                  <div className="text-xs text-zinc-500 text-center py-12">No orders found matching the filter criteria.</div>
                ) : (
                  <div className="space-y-4">
                    {historyOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-burgundy-800 dark:text-gold-400 text-sm">
                                {ord.orderNumber || `#${ord._id}`}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                • {new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Payment Status Dropdown Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Payment:</span>
                              <select
                                value={ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
                                onChange={(e) => handlePaymentStatusChange(ord._id, e.target.value)}
                                className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-gold-500 ${
                                  ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </div>

                            {/* Order Status Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Status:</span>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready">Ready</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="text-[10px] text-zinc-400 uppercase border-b border-zinc-200 dark:border-zinc-800">
                              <tr>
                                <th className="pb-2">Item</th>
                                <th className="pb-2 text-center">Portion</th>
                                <th className="pb-2 text-center">Qty</th>
                                <th className="pb-2 text-right">Price</th>
                                <th className="pb-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                              {ord.items.map((it, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 font-medium">{it.name}</td>
                                  <td className="py-2 text-center text-zinc-400">{it.portion || '-'}</td>
                                  <td className="py-2 text-center font-bold">{it.quantity}</td>
                                  <td className="py-2 text-right">₹{it.price}</td>
                                  <td className="py-2 text-right font-bold">₹{it.price * it.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer Total */}
                        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/60 pt-3 text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Payment Method: <strong className="text-zinc-900 dark:text-white">{ord.paymentMethod || 'COD'}</strong>
                          </span>
                          <div className="text-right">
                            <span className="text-xs text-zinc-500 mr-2">Total Amount:</span>
                            <span className="font-bold text-base text-zinc-900 dark:text-white">₹{ord.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs text-zinc-500">
                    <span>
                      Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalFilteredOrders} total orders)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
