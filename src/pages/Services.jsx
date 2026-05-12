import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import {
  Search, MapPin, Filter,
  ChevronLeft, ChevronRight, Loader
} from 'lucide-react';

const CATEGORIES = [
  'ALL', 'PLUMBING', 'ELECTRICAL', 'CLEANING',
  'CARPENTRY', 'PAINTING', 'AC_REPAIR',
  'APPLIANCE_REPAIR', 'BEAUTY', 'FITNESS',
  'TUTORING', 'OTHER'
];

const ServiceCard = ({ service }) => (
  <Link
    to={`/services/${service.id}`}
    className="group bg-white rounded-3xl border border-gray-100
    p-5 sm:p-6 flex flex-col gap-4 shadow-sm
    hover:shadow-2xl hover:-translate-y-2
    transition-all duration-300 cursor-pointer hover:border-blue-100"
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-gray-800 text-lg leading-tight">
          {service.title}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5
          rounded-full font-medium mt-1 inline-block">
          {service.category?.replace(/_/g, ' ')}  {/* ✅ fix — replace ALL underscores */}
        </span>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-blue-600">
          ₹{service.price}
        </div>
      </div>
    </div>

    <p className="text-gray-500 text-sm line-clamp-2">
      {service.description}
    </p>

    <div className="flex items-center justify-between mt-auto pt-2
      border-t border-gray-100">
      <div className="flex items-center gap-1 text-gray-500 text-sm">
        <MapPin size={14} />
        <span className="capitalize">{service.city}, {service.area}</span> {/* ✅ capitalize city/area */}
      </div>
      <div className="text-sm text-gray-500">
        by <span className="font-medium text-gray-700">
          {service.providerName}
        </span>
      </div>
    </div>
  </Link>
);

const Services = () => {
  const [searchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // ✅ fix — sanitize URL param properly
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const raw = searchParams.get('category') || 'ALL';
    return raw.replace(/ /g, '_').toUpperCase();
  });

  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let response;

      if (keyword) {
        response = await api.get('/api/services/search', {
          params: { keyword, page, size: 9 }
        });

      } else if (city || selectedCategory !== 'ALL' || minPrice || maxPrice) {
        response = await api.get('/api/services/filter', {
          params: {
            city: city || undefined,
            category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            page,
            size: 9,
            sortBy: 'createdAt',  // ✅ fixed
            sortDir: 'desc'
          }
        });

      } else {
        response = await api.get('/api/services', {
          params: { page, size: 9, sortBy: 'createdAt', sortDir: 'desc' }
        });
      }

      const data = response.data.data;
      setServices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);

    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]); // ✅ fix — clear on error so blank screen doesn't hang
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [keyword, selectedCategory, city, minPrice, maxPrice, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(0);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setKeyword('');
    setSearchInput('');
    setPage(0);
  };

  const handleFilter = () => {
    setKeyword('');
    setSearchInput('');
    setPage(0);
    // ✅ fix — removed manual fetchServices() call, useEffect handles it
  };

  const handleReset = () => {
    setKeyword('');
    setSearchInput('');
    setSelectedCategory('ALL');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Find Services
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                text-gray-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search services (e.g. AC Repair, Cleaning...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300
                  rounded-xl focus:outline-none focus:ring-2
                  focus:ring-blue-500 transition"
              />
            </div>
            <button type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl
                hover:bg-blue-700 font-semibold transition">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-2 md:flex gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input
                type="text" value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full md:w-32 px-3 py-2 border border-gray-300
                  rounded-lg text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <input
                type="number" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="₹0"
                className="w-full md:w-32 px-3 py-2 border border-gray-300
                  rounded-lg text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <input
                type="number" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="₹9999"
                className="w-24 px-3 py-2 border border-gray-300
                  rounded-lg text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-500"
              />
            </div>
            <button type="button" onClick={handleFilter}
              className="flex items-center gap-2 bg-gray-800 text-white
                px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition">
              <Filter size={16} />
              Apply
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg
                text-sm text-gray-600 hover:bg-gray-100 transition">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                whitespace-nowrap transition
                ${selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}>
              {cat.replace(/_/g, ' ')}  {/* ✅ replace ALL underscores */}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-4">
            Found <span className="font-semibold text-gray-800">
              {totalElements}
            </span> services
            {keyword && ` for "${keyword}"`}
            {selectedCategory !== 'ALL' && (
              <span> in <span className="font-semibold text-gray-800">
                {selectedCategory.replace(/_/g, ' ')}
              </span></span>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <Search className="mx-auto text-gray-300 mb-4" size={60} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No services found
            </h3>
            <p className="text-gray-400">
              Try a different search or reset filters
            </p>
            <button onClick={handleReset}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg
                hover:bg-blue-700 transition">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 border
                border-gray-300 rounded-lg disabled:opacity-50
                hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
              Prev
            </button>
            <span className="text-gray-600 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 border
                border-gray-300 rounded-lg disabled:opacity-50
                hover:bg-gray-100 transition">
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;