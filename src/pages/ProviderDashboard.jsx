import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Loader, Plus,
  Pencil, Trash2, ToggleLeft, ToggleRight,
  Package, BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'services'
  const [bookingFilter, setBookingFilter] = useState('PENDING');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get('/api/bookings/provider-bookings'),
        api.get('/api/services/my-services')
      ]);
      setBookings(bookingsRes.data.data || []);
      setMyServices(servicesRes.data.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (id, action) => {
    try {
      await api.put(`/api/bookings/${id}/${action}`);
      toast.success(`Booking ${action}ed!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteService = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/services/${id}`);
      toast.success('Service deleted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredBookings = bookingFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row
          justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Provider Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your services and bookings
            </p>
          </div>
          <Link to="/create-service"
            className="flex items-center gap-2 bg-blue-600 text-white
              px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700
              transition shadow-md">
            <Plus size={18} />
            Add New Service
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Services', value: myServices.length, color: 'blue' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: 'yellow' },
            { label: 'Accepted', value: bookings.filter(b => b.status === 'ACCEPTED').length, color: 'green' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, color: 'purple' },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <p className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Tabs — Bookings vs Services */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
              font-semibold text-sm transition
              ${activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>
            <BookOpen size={16} />
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
              font-semibold text-sm transition
              ${activeTab === 'services'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>
            <Package size={16} />
            My Services ({myServices.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : activeTab === 'bookings' ? (

          /* ── BOOKINGS SECTION ── */
          <>
            {/* Booking Status Filter */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(status => (
                <button key={status}
                  onClick={() => setBookingFilter(status)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold
                    whitespace-nowrap transition
                    ${bookingFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}>
                  {status}
                  {status !== 'ALL' && (
                    <span className="ml-1">
                      ({bookings.filter(b => b.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">
                  No {bookingFilter.toLowerCase()} bookings
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => (
                  <div key={booking.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row
                      sm:justify-between sm:items-start gap-4">

                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 text-lg">
                            {booking.serviceTitle}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          👤 Customer:
                          <span className="font-semibold text-gray-800 ml-1">
                            {booking.customerName}
                          </span>
                          <span className="text-gray-400 ml-1">
                            (@{booking.customerUsername})
                          </span>
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          📅 {new Date(booking.scheduledAt).toLocaleString('en-IN', {
                            dateStyle: 'medium', timeStyle: 'short'
                          })}
                        </p>
                        {booking.address && (
                          <p className="text-gray-500 text-sm">
                            📍 {booking.address}
                          </p>
                        )}
                        {booking.notes && (
                          <p className="text-gray-400 text-sm italic mt-1">
                            📝 "{booking.notes}"
                          </p>
                        )}
                        <p className="text-blue-600 font-bold mt-2">
                          ₹{booking.servicePrice}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'accept')}
                              className="flex items-center gap-1.5 px-4 py-2
                                bg-green-600 text-white rounded-xl text-sm
                                font-semibold hover:bg-green-700 transition">
                              <CheckCircle size={15} /> Accept
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              className="flex items-center gap-1.5 px-4 py-2
                                border border-red-300 text-red-500 rounded-xl
                                text-sm hover:bg-red-50 transition">
                              <XCircle size={15} /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleBookingAction(booking.id, 'complete')}
                            className="flex items-center gap-1.5 px-4 py-2
                              bg-purple-600 text-white rounded-xl text-sm
                              font-semibold hover:bg-purple-700 transition">
                            <CheckCircle size={15} /> Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>

        ) : (

          /* ── MY SERVICES SECTION ── */
          <>
            {myServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium mb-4">
                  You haven't created any services yet
                </p>
                <Link to="/create-service"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl
                    font-semibold hover:bg-blue-700 transition inline-flex
                    items-center gap-2">
                  <Plus size={16} /> Create Your First Service
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myServices.map(service => (
                  <div key={service.id}
                    className="bg-white rounded-2xl border border-gray-100
                      shadow-sm overflow-hidden hover:shadow-md transition">

                    {/* Service Header */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs bg-blue-100 text-blue-600
                          px-2 py-0.5 rounded-full font-medium">
                          {service.category?.replace('_', ' ')}
                        </span>
                        {/* Available badge */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                          ${service.available
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500'}`}>
                          {service.available ? '● Active' : '● Inactive'}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-800 text-lg mt-2 mb-1">
                        {service.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600">
                          ₹{service.price}
                        </span>
                        <span className="text-xs text-gray-400">
                          📍 {service.city}, {service.area}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="border-t border-gray-100 px-5 py-3
                      flex items-center justify-between bg-gray-50">
                      <button
                        onClick={() => navigate(`/edit-service/${service.id}`)}
                        className="flex items-center gap-1.5 text-sm
                          text-blue-600 hover:text-blue-800 font-medium
                          transition">
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteService(service.id, service.title)}
                        className="flex items-center gap-1.5 text-sm
                          text-red-500 hover:text-red-700 font-medium
                          transition">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ProviderDashboard;