import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader } from 'lucide-react';

const CATEGORIES = [
  'PLUMBING', 'ELECTRICAL', 'CLEANING', 'CARPENTRY',
  'PAINTING', 'AC_REPAIR', 'APPLIANCE_REPAIR',
  'BEAUTY', 'FITNESS', 'TUTORING', 'OTHER'
];

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: 'PLUMBING', city: '', area: '',
    latitude: '', longitude: ''
  });

  // Load existing service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/api/services/${id}`);
        const s = res.data.data;
        setForm({
          title: s.title || '',
          description: s.description || '',
          price: s.price || '',
          category: s.category || 'PLUMBING',
          city: s.city || '',
          area: s.area || '',
          latitude: s.latitude || '',
          longitude: s.longitude || ''
        });
      } catch {
        toast.error('Failed to load service');
        navigate('/provider-dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/services/${id}`, {
        ...form,
        price: parseFloat(form.price),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });
      toast.success('Service updated successfully! ✅');
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/provider-dashboard')}
          className="flex items-center gap-2 text-gray-600
            hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Edit Service
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Update your service details below
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Service Title
              </label>
              <input
                name="title" type="text" required
                value={form.title} onChange={handleChange}
                placeholder="e.g. AC Repair & Servicing"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  bg-white">
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                name="price" type="number" required min="1"
                value={form.price} onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City + Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City
                </label>
                <input
                  name="city" type="text" required
                  value={form.city} onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Area
                </label>
                <input
                  name="area" type="text" required
                  value={form.area} onChange={handleChange}
                  placeholder="e.g. Kothrud"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description" required rows={4}
                value={form.description} onChange={handleChange}
                placeholder="Describe your service in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Optional coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Latitude <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="latitude" type="number" step="any"
                  value={form.latitude} onChange={handleChange}
                  placeholder="e.g. 18.5204"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Longitude <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="longitude" type="number" step="any"
                  value={form.longitude} onChange={handleChange}
                  placeholder="e.g. 73.8567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/provider-dashboard')}
                className="flex-1 py-3 border border-gray-300 rounded-xl
                  text-gray-600 hover:bg-gray-50 transition font-medium">
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl
                  font-bold hover:bg-blue-700 transition disabled:opacity-50
                  flex items-center justify-center gap-2">
                {saving
                  ? <><Loader size={16} className="animate-spin" /> Saving...</>
                  : '✅ Save Changes'
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditService;