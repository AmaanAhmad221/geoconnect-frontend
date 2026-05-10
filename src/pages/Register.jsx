import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  MapPin,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post('/api/auth/register', formData);

      toast.success('Account created successfully! 🎉');

      navigate('/login');

    } catch (error) {

      const data = error.response?.data;

      if (Array.isArray(data?.data)) {
        data.data.forEach(err =>
          toast.error(`${err.field}: ${err.message}`)
        );
      } else {
        toast.error(data?.message || 'Registration failed!');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br
      from-slate-50 via-blue-50 to-indigo-100
      flex items-center justify-center
      px-4 py-10">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md
          border border-white/40
          rounded-3xl shadow-2xl
          p-6 sm:p-8">

          {/* Logo */}
          <div className="text-center mb-8">

            <div className="flex items-center justify-center gap-3 mb-4">

              <div className="w-14 h-14 rounded-2xl
                bg-blue-100 flex items-center justify-center">
                <MapPin className="text-blue-600" size={28} />
              </div>

              <div className="text-left">
                <h1 className="text-2xl font-extrabold text-gray-800">
                  GeoConnect
                </h1>

                <p className="text-sm text-gray-400">
                  Smart Local Services
                </p>
              </div>

            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>

            <p className="text-gray-500 mt-2">
              Join GeoConnect today 🚀
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3.5 rounded-xl
                border border-gray-200 bg-white
                focus:outline-none focus:ring-4
                focus:ring-blue-100 focus:border-blue-500
                transition"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g johndoe"
                required
                className="w-full px-4 py-3.5 rounded-xl
                border border-gray-200 bg-white
                focus:outline-none focus:ring-4
                focus:ring-blue-100 focus:border-blue-500
                transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3.5 rounded-xl
                border border-gray-200 bg-white
                focus:outline-none focus:ring-4
                focus:ring-blue-100 focus:border-blue-500
                transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl
                  border border-gray-200 bg-white
                  focus:outline-none focus:ring-4
                  focus:ring-blue-100 focus:border-blue-500
                  transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2
                  -translate-y-1/2 text-gray-400
                  hover:text-gray-600 transition"
                >
                  {showPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />
                  }
                </button>

              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3.5 rounded-xl
                border border-gray-200 bg-white
                focus:outline-none focus:ring-4
                focus:ring-blue-100 focus:border-blue-500
                transition"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white
              py-3.5 rounded-xl shadow-lg
              hover:bg-blue-700 hover:shadow-xl
              hover:shadow-blue-200/50
              transition-all duration-300
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              font-semibold text-[15px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white
                  border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <p className="text-center text-gray-500 mt-7 text-sm">
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-blue-600 font-semibold
              hover:text-blue-700 transition"
            >
              Login here
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Register;