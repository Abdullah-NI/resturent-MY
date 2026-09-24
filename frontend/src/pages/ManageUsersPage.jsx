import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, UserX } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        showToast('User status updated', 'info');
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Registered Users</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">View customer profiles and manage permissions</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-slate-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">{u.name}</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">{u.phone}</td>
                    <td className="p-3 font-bold text-burgundy-800 dark:text-gold-400 uppercase text-[10px]">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
