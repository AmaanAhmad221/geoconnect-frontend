import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  MapPin, Star, User, Calendar,
  ArrowLeft, Loader, CheckCircle, IndianRupee, Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Fix Leaflet marker icon bug in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Blue marker — user location
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red marker — provider location
const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ✅ Click handler inside map
const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// ✅ Map Picker Component
const MapPicker = ({ onLocationSelect, providerLat, providerLng, providerName }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [mapCenter] = useState(
    providerLat && providerLng
      ? [providerLat, providerLng]
      : [18.5204, 73.8567]
  );

  // Auto detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported!');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedLocation({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        toast.error('Could not detect location. Click on map to select.');
      },
      { timeout: 10000 }
    );
  };

  const handleMapClick = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onLocationSelect(lat, lng, addr);
  };

  return (
    <div className="space-y-2">

      {/* Header + detect button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Your Location
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="flex items-center gap-1.5 text-xs bg-blue-50
            text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100
            transition disabled:opacity-50">
          {detecting
            ? <Loader size={12} className="animate-spin" />
            : <Navigation size={12} />
          }
          {detecting ? 'Detecting...' : 'Auto Detect'}
        </button>
      </div>

      {/* Address display */}
      {address && (
        <div className="flex items-start gap-2 p-2.5 bg-blue-50
          rounded-xl border border-blue-100">
          <MapPin size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed line-clamp-2">
            {address}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200"
        style={{ height: '220px' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationSelector onLocationSelect={handleMapClick} />

          {/* User marker */}
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={userIcon}>
              <Popup>
                <p className="text-sm font-semibold">📍 Your Location</p>
                <p className="text-xs text-gray-500 mt-0.5">{address}</p>
              </Popup>
            </Marker>
          )}

          {/* Provider marker */}
          {providerLat && providerLng && (
            <Marker
              position={[providerLat, providerLng]}
              icon={providerIcon}>
              <Popup>
                <p className="text-sm font-semibold">🔧 {providerName}</p>
                <p className="text-xs text-gray-500">Service Provider</p>
              </Popup>
            </Marker>
          )}

        </MapContainer>
      </div>

      <p className="text-xs text-gray-400 text-center">
        📌 Click on map to change your location
      </p>
    </div>
  );
};

// ✅ Main ServiceDetail Component
const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookingData, setBookingData] = useState({
    notes: '',
    address: '',
    scheduledAt: '',
    latitude: null,   // ✅ from map
    longitude: null,  // ✅ from map
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const serviceRes = await api.get(`/api/services/${id}`);
      const serviceData = serviceRes.data.data;
      setService(serviceData);

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

  // ✅ Called by MapPicker when location is selected
  const handleLocationSelect = (lat, lng, address) => {
    setBookingData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address,
    }));
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
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        scheduledAt: bookingData.scheduledAt,
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

        {/* Back */}
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-gray-600
            hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={20} />
          Back to Services
        </button>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left — Service Info ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Service Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row
                sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <span className="text-xs bg-blue-100 text-blue-600
                    px-3 py-1 rounded-full font-medium">
                    {service.category?.replace(/_/g, ' ')}
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
                <span className="capitalize">{service.city}, {service.area}</span>
              </div>

              <div className="mt-4">
                {service.available ? (
                  <span className="flex items-center gap-1
                    text-green-600 text-sm font-medium">
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
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
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
                            <Star key={i} size={14}
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

          {/* ── Right — Booking Card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm lg:sticky lg:top-20">

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
                    <form onSubmit={handleBookingSubmit} className="space-y-4">

                      {/* ✅ MAP PICKER */}
                      <MapPicker
                        onLocationSelect={handleLocationSelect}
                        providerLat={service.latitude}
                        providerLng={service.longitude}
                        providerName={service.providerName}
                      />

                      {/* Address — auto filled, editable */}
                      <div>
                        <label className="block text-sm font-medium
                          text-gray-700 mb-1">
                          Service Address
                        </label>
                        <input
                          type="text"
                          value={bookingData.address}
                          onChange={(e) => setBookingData({
                            ...bookingData, address: e.target.value
                          })}
                          placeholder="Auto-filled from map"
                          required
                          className="w-full px-3 py-2 border border-gray-300
                            rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Schedule */}
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

                      {/* Notes */}
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
                          rows={2}
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

              {/* Highlights */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                {['Verified Provider', 'Secure Payment', 'Easy Cancellation'].map((item) => (
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