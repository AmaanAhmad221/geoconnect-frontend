import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, User, Clock,
  CheckCircle, XCircle, Loader,
  AlertCircle, Star
} from 'lucide-react';

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  ACCEPTED:  'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const STATUS_ICONS = {
  PENDING:   <Clock size={14} />,
  ACCEPTED:  <CheckCircle size={14} />,
  COMPLETED: <CheckCircle size={14} />,
  REJECTED:  <XCircle size={14} />,
  CANCELLED: <XCircle size={14} />,
};

const BookingCard = ({ booking, onCancel, onReview, isProvider }) => (
  <div className="bg-white rounded-3xl border border-gray-200 p-5
    hover:shadow-md transition">

    {/* Header */}
    <div className="flex flex-col sm:flex-row
  sm:justify-between sm:items-start gap-3 mb-4">
      <div>
        <h3 className="font-bold text-gray-800 text-lg">
          {booking.serviceTitle}
        </h3>
        <p className="text-gray-500 text-sm mt-0.5">
          {isProvider
            ? `Customer: ${booking.customerName}`
            : `Provider: ${booking.providerName}`
          }
        </p>
      </div>
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full
        text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
        {STATUS_ICONS[booking.status]}
        {booking.status}
      </span>
    </div>

    {/* Details */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar size={15} className="text-blue-500" />
        <span>
          {new Date(booking.scheduledAt).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short'
          })}
        </span>
      </div>
      {booking.address && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={15} className="text-blue-500" />
          <span>{booking.address}</span>
        </div>
      )}
      {booking.notes && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle size={15} className="text-blue-500" />
          <span>{booking.notes}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-blue-600">
          ₹{booking.servicePrice}
        </span>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-2
  pt-3 border-t border-gray-100">
      {/* Customer can cancel PENDING bookings */}
      {!isProvider && booking.status === 'PENDING' && (
        <button
          onClick={() => onCancel(booking.id)}
          className="px-4 py-2 text-sm border border-red-300
            text-red-500 rounded-lg hover:bg-red-50 transition">
          Cancel Booking
        </button>
      )}

      {/* Customer can review COMPLETED bookings */}
      {!isProvider && booking.status === 'COMPLETED' && (
        <button
          onClick={() => onReview(booking)}
          className="flex items-center gap-1 px-4 py-2 text-sm
            bg-yellow-50 border border-yellow-300 text-yellow-700
            rounded-lg hover:bg-yellow-100 transition">
          <Star size={14} />
          Write Review
        </button>
      )}

      <span className="text-xs text-gray-400 ml-auto self-center">
        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
      </span>
    </div>
  </div>
);

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(booking.id, rating, comment);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center
  justify-center z-50 px-4 overflow-y-auto py-6">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Review {booking.serviceTitle}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium
              text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition">
                  <Star
                    size={32}
                    className={star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 fill-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium
              text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-300
                rounded-xl focus:outline-none focus:ring-2
                focus:ring-blue-500 resize-none text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300
                rounded-xl text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white
                rounded-xl font-semibold hover:bg-blue-700 transition
                disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <Loader className="animate-spin" size={18} />
                : 'Submit Review'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const { isProvider } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = isProvider
        ? '/api/bookings/provider-bookings'
        : '/api/bookings/my-bookings';
      const response = await api.get(endpoint);
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isProvider]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleReviewSubmit = async (bookingId, rating, comment) => {
    try {
      await api.post('/api/reviews', { bookingId, rating, comment });
      toast.success('Review submitted! ⭐');
      setReviewBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const TABS = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];

  const filteredBookings = activeTab === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row
  sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {isProvider ? 'Customer Bookings' : 'My Bookings'}
            </h1>
            <p className="text-gray-500 mt-1">
              {bookings.length} total bookings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6
  scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                whitespace-nowrap transition
                ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}>
              {tab}
              {tab !== 'ALL' && (
                <span className="ml-1 text-xs">
                  ({bookings.filter(b => b.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="mx-auto text-gray-300 mb-4" size={60} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-400">
              {activeTab === 'ALL'
                ? "You haven't made any bookings yet"
                : `No ${activeTab.toLowerCase()} bookings`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onReview={setReviewBooking}
                isProvider={isProvider}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default MyBookings;