import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  MapPin, Star, User, Clock,
  Calendar, ArrowLeft, Loader,
  CheckCircle, IndianRupee
} from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer, user } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookingData, setBookingData] = useState({
    notes: '',
    address: '',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      // Step 1 — Get service details first
      const serviceRes = await api.get(`/api/services/${id}`);
      const serviceData = serviceRes.data.data;
      setService(serviceData);

      // Step 2 — Use providerUsername (not service id!)
      const providerUsername = serviceData?.providerUsername;

      if (providerUsername) {
        const [reviewsRes, ratingRes] = await Promise.all([
          api.get(`/api/reviews/provider/${providerUsername}`),
          api.get(`/api/reviews/rating/${providerUsername}`)
        ]);
        setReviews(reviewsRes.data.data || []);
        setRating(ratingRes.data.data);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book!');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/api/bookings', {
        serviceId: parseInt(id),
        notes: bookingData.notes,
        address: bookingData.address,
        scheduledAt: bookingData.scheduledAt
      });

      toast.success('Booking created successfully! 🎉');
      setShowBookingForm(false);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed!');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Service not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-gray-600
            hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={20} />
          Back to Services
        </button>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — Service Info */}
          <div className="md:col-span-2 space-y-4">

            {/* Service Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row
  sm:justify-between sm:items-start
  gap-3 mb-4">
                <div>
                  <span className="text-xs bg-blue-100 text-blue-600
                    px-3 py-1 rounded-full font-medium">
                    {service.category?.replace('_', ' ')}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                    {service.title}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl
                    font-bold text-blue-600">
                    <IndianRupee size={20} />
                    {service.price}
                  </div>
                  <span className="text-xs text-gray-400">per visit</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">
                {service.description}
              </p>

              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={16} className="text-blue-500" />
                <span>{service.city}, {service.area}</span>
              </div>

              {/* Available Badge */}
              <div className="mt-4">
                {service.available ? (
                  <span className="flex items-center gap-1 text-green-600
                    text-sm font-medium">
                    <CheckCircle size={16} />
                    Available for booking
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">
                    Currently unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                About the Provider
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full
                  flex items-center justify-center">
                  <User className="text-blue-600" size={28} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {service.providerName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    @{service.providerUsername}
                  </p>
                  {rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-400 fill-yellow-400"
                        size={16} />
                      <span className="font-medium text-gray-700">
                        {rating.averageRating}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({rating.totalReviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Customer Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id}
                      className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {review.customerName}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i}
                              size={14}
                              className={i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200 fill-gray-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Booking Card */}
          <div className="md:col-span-1">
           <div className="bg-white rounded-2xl p-5 sm:p-6
  shadow-sm lg:sticky lg:top-20">
              <div className="text-center mb-5">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  ₹{service.price}
                </div>
                <p className="text-gray-400 text-sm">per visit</p>
              </div>

              {isAuthenticated && isCustomer ? (
                <>
                  {!showBookingForm ? (
                    <button
                      onClick={() => setShowBookingForm(true)}
                      disabled={!service.available}
                      className="w-full bg-blue-600 text-white py-3
                        rounded-xl font-bold hover:bg-blue-700 transition
                        disabled:opacity-50 disabled:cursor-not-allowed">
                      Book Now
                    </button>
                  ) : (
                    <form onSubmit={handleBookingSubmit}
                      className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium
                          text-gray-700 mb-1">
                          Your Address
                        </label>
                        <input
                          type="text"
                          value={bookingData.address}
                          onChange={(e) => setBookingData({
                            ...bookingData, address: e.target.value
                          })}
                          placeholder="Service location"
                          required
                          className="w-full px-3 py-2 border border-gray-300
                            rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium
                          text-gray-700 mb-1">
                          Schedule Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={bookingData.scheduledAt}
                          onChange={(e) => setBookingData({
                            ...bookingData, scheduledAt: e.target.value
                          })}
                          required
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-3 py-2 border border-gray-300
                            rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium
                          text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({
                            ...bookingData, notes: e.target.value
                          })}
                          placeholder="Any specific instructions..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300
                            rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full bg-blue-600 text-white py-3
                          rounded-xl font-bold hover:bg-blue-700 transition
                          disabled:opacity-50 flex items-center
                          justify-center gap-2">
                        {bookingLoading ? (
                          <Loader className="animate-spin" size={18} />
                        ) : (
                          <>
                            <Calendar size={18} />
                            Confirm Booking
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="w-full py-2 text-gray-500 text-sm
                          hover:text-gray-700 transition">
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              ) : !isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-3">
                    Login to book this service
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-600 text-white py-3
                      rounded-xl font-bold hover:bg-blue-700 transition">
                    Login to Book
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  Only customers can book services
                </div>
              )}

              {/* Service Highlights */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                {[
                  'Verified Provider',
                  'Secure Payment',
                  'Easy Cancellation'
                ].map((item) => (
                  <div key={item}
                    className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle size={14} className="text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;