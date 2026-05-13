import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Users, Package, BookOpen, Star,
  TrendingUp, Shield, Trash2, Loader,
  ToggleLeft, ToggleRight, UserCheck,
  BarChart3, AlertCircle
} from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center
        justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

// ── Tab Button ────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
      font-semibold text-sm transition
      ${active
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
      }`}>
    {icon}
    {label}
  </button>
);

// ── Role Badge ────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN:    'bg-red-100 text-red-600',
    PROVIDER: 'bg-green-100 text-green-600',
    CUSTOMER: 'bg-blue-100 text-blue-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
      ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
};

// ── Main AdminPanel ───────────────────────────────────────
const AdminPanel = () => {
  const [activeTab, setActiveTab]   = useState('stats');
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [roleInput, setRoleInput]   = useState({});

  // ── Fetch all data ──────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, servicesRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/services'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setServices(servicesRes.data.data || []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete user ─────────────────────────────────────────
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionLoading(`user-${id}`);
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted!');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Change user role ────────────────────────────────────
  const handleRoleChange = async (id, newRole) => {
    if (!newRole) return;
    setActionLoading(`role-${id}`);
    try {
      const res = await api.put(
        `/api/admin/users/${id}/role?role=${newRole}`
      );
      toast.success(`Role updated to ${newRole}!`);
      setUsers(prev =>
        prev.map(u => u.id === id ? res.data.data : u)
      );
      setRoleInput(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Toggle service availability ─────────────────────────
  const handleToggleService = async (id) => {
    setActionLoading(`service-${id}`);
    try {
      const res = await api.put(`/api/admin/services/${id}/toggle`);
      toast.success('Service availability toggled!');
      setServices(prev =>
        prev.map(s => s.id === id ? res.data.data : s)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle service');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete service ──────────────────────────────────────
  const handleDeleteService = async (id, title) => {
    if (!window.confirm(`Delete service "${title}"?`)) return;
    setActionLoading(`del-service-${id}`);
    try {
      await api.delete(`/api/admin/services/${id}`);
      toast.success('Service deleted!');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl
              flex items-center justify-center">
              <Shield className="text-red-500" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-500 ml-13">
            Manage users, services and platform stats
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          <TabBtn
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 size={16} />}
            label="Stats"
          />
          <TabBtn
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={16} />}
            label={`Users (${users.length})`}
          />
          <TabBtn
            active={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
            icon={<Package size={16} />}
            label={`Services (${services.length})`}
          />
        </div>

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Users size={20} className="text-blue-600" />}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-blue-50"
              />
              <StatCard
                icon={<UserCheck size={20} className="text-green-600" />}
                label="Providers"
                value={stats.totalProviders}
                color="bg-green-50"
              />
              <StatCard
                icon={<Users size={20} className="text-purple-600" />}
                label="Customers"
                value={stats.totalCustomers}
                color="bg-purple-50"
              />
              <StatCard
                icon={<Package size={20} className="text-orange-600" />}
                label="Total Services"
                value={stats.totalServices}
                color="bg-orange-50"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<BookOpen size={20} className="text-blue-600" />}
                label="Total Bookings"
                value={stats.totalBookings}
                color="bg-blue-50"
              />
              <StatCard
                icon={<AlertCircle size={20} className="text-yellow-600" />}
                label="Pending Bookings"
                value={stats.pendingBookings}
                color="bg-yellow-50"
              />
              <StatCard
                icon={<TrendingUp size={20} className="text-green-600" />}
                label="Completed"
                value={stats.completedBookings}
                color="bg-green-50"
              />
              <StatCard
                icon={<Star size={20} className="text-yellow-600" />}
                label="Total Reviews"
                value={stats.totalReviews}
                color="bg-yellow-50"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700
                rounded-2xl p-5 text-white">
                <p className="text-blue-200 text-sm mb-1">Platform Health</p>
                <p className="text-3xl font-bold mb-1">
                  {stats.totalBookings > 0
                    ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                    : 0}%
                </p>
                <p className="text-blue-200 text-sm">Completion Rate</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700
                rounded-2xl p-5 text-white">
                <p className="text-green-200 text-sm mb-1">Active Providers</p>
                <p className="text-3xl font-bold mb-1">
                  {stats.totalProviders}
                </p>
                <p className="text-green-200 text-sm">
                  Out of {stats.totalUsers} users
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700
                rounded-2xl p-5 text-white">
                <p className="text-purple-200 text-sm mb-1">Pending Actions</p>
                <p className="text-3xl font-bold mb-1">
                  {stats.pendingBookings}
                </p>
                <p className="text-purple-200 text-sm">
                  Bookings awaiting response
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">

            {/* Filter buttons */}
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'CUSTOMER', 'PROVIDER', 'ADMIN'].map(role => (
                <span key={role}
                  className="text-xs px-3 py-1 bg-white border
                    border-gray-200 rounded-full text-gray-600">
                  {role}: {role === 'ALL'
                    ? users.length
                    : users.filter(u => u.role === role).length
                  }
                </span>
              ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border
              border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold
                        text-gray-500 uppercase tracking-wide">
                        User
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold
                        text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold
                        text-gray-500 uppercase tracking-wide">
                        Role
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold
                        text-gray-500 uppercase tracking-wide">
                        Change Role
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold
                        text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}
                        className="border-b border-gray-50
                          hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {user.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              @{user.username}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={roleInput[user.id] || ''}
                              onChange={e => setRoleInput(prev => ({
                                ...prev, [user.id]: e.target.value
                              }))}
                              className="text-xs px-2 py-1.5 border
                                border-gray-300 rounded-lg bg-white
                                focus:outline-none focus:ring-2
                                focus:ring-blue-500">
                              <option value="">Select</option>
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="PROVIDER">PROVIDER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(
                                user.id, roleInput[user.id]
                              )}
                              disabled={
                                !roleInput[user.id] ||
                                actionLoading === `role-${user.id}`
                              }
                              className="text-xs px-3 py-1.5 bg-blue-600
                                text-white rounded-lg hover:bg-blue-700
                                transition disabled:opacity-50">
                              {actionLoading === `role-${user.id}`
                                ? <Loader size={12} className="animate-spin" />
                                : 'Apply'
                              }
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={actionLoading === `user-${user.id}`}
                            className="flex items-center gap-1 text-xs
                              text-red-500 hover:text-red-700
                              hover:bg-red-50 px-3 py-1.5 rounded-lg
                              transition disabled:opacity-50">
                            {actionLoading === `user-${user.id}`
                              ? <Loader size={12} className="animate-spin" />
                              : <Trash2 size={13} />
                            }
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SERVICES TAB ── */}
        {activeTab === 'services' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(service => (
              <div key={service.id}
                className="bg-white rounded-2xl border border-gray-100
                  shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-blue-100 text-blue-600
                      px-2 py-0.5 rounded-full font-medium">
                      {service.category?.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      font-semibold
                      ${service.available
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'}`}>
                      {service.available ? '● Active' : '● Inactive'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 mt-2 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{service.price}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      📍 {service.city}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    By: <span className="font-medium text-gray-600">
                      {service.providerName}
                    </span>
                  </p>
                </div>

                {/* Action Bar */}
                <div className="border-t border-gray-100 px-5 py-3
                  flex items-center justify-between bg-gray-50">

                  {/* Toggle availability */}
                  <button
                    onClick={() => handleToggleService(service.id)}
                    disabled={actionLoading === `service-${service.id}`}
                    className={`flex items-center gap-1.5 text-xs
                      font-medium transition px-3 py-1.5 rounded-lg
                      disabled:opacity-50
                      ${service.available
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'}`}>
                    {actionLoading === `service-${service.id}`
                      ? <Loader size={12} className="animate-spin" />
                      : service.available
                        ? <ToggleRight size={14} />
                        : <ToggleLeft size={14} />
                    }
                    {service.available ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteService(service.id, service.title)}
                    disabled={actionLoading === `del-service-${service.id}`}
                    className="flex items-center gap-1.5 text-xs
                      text-red-500 hover:text-red-700 hover:bg-red-50
                      px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                    {actionLoading === `del-service-${service.id}`
                      ? <Loader size={12} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;