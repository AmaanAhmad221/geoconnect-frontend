import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'PLUMBING','ELECTRICAL','CLEANING','CARPENTRY',
  'PAINTING','AC_REPAIR','APPLIANCE_REPAIR',
  'BEAUTY','FITNESS','TUTORING','OTHER'
];

const CreateService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: 'PLUMBING', city: '', area: '',
    latitude: '', longitude: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/services', {
        ...form,
        price: parseFloat(form.price),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });
      toast.success('Service created!');
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Create New Service
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Service Title', name: 'title', placeholder: 'e.g. AC Repair & Servicing' },
            { label: 'City', name: 'city', placeholder: 'e.g. Pune' },
            { label: 'Area', name: 'area', placeholder: 'e.g. Kothrud' },
            { label: 'Price (₹)', name: 'price', placeholder: '500', type: 'number' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input type={field.type || 'text'} required
                value={form[field.name]}
                onChange={e => setForm({...form, [field.name]: e.target.value})}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea required rows={4}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe your service in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl
              font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateService;