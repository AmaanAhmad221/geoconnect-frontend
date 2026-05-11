import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  LogOut,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, isProvider, isAdmin, user, logout } = useAuth(); // ✅ added isProvider, isAdmin
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">

      <div className="container-custom">
        <div className="h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-blue-100
              flex items-center justify-center
              group-hover:scale-105 transition">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 leading-none">
                GeoConnect
              </h1>
              <p className="text-xs text-gray-400">Smart Local Services</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">

            <Link to="/services"
              className="text-[15px] font-medium text-gray-600 hover:text-blue-600 transition">
              Services
            </Link>

            {isAuthenticated && (
              <>
                {/* ✅ Dashboard — only for PROVIDER and ADMIN */}
                {(isProvider || isAdmin) && (
                  <Link to="/provider-dashboard"
                    className="text-[15px] font-medium text-gray-600 hover:text-blue-600 transition
                      flex items-center gap-1">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                <Link to="/my-bookings"
                  className="text-[15px] font-medium text-gray-600 hover:text-blue-600 transition">
                  My Bookings
                </Link>

                <Link to="/profile"
                  className="text-[15px] font-medium text-gray-600 hover:text-blue-600 transition">
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right — User info + Logout */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <span className={`text-xs font-medium
                    ${isAdmin ? 'text-red-500' :
                      isProvider ? 'text-green-600' :
                      'text-blue-600'}`}>
                    {user?.role}
                  </span>
                </div>

                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                  border border-red-100 text-red-500 hover:bg-red-50 transition">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition">
                  Login
                </Link>
                <Link to="/register"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white
                  font-semibold hover:bg-blue-700 transition shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-11 h-11 rounded-xl
            border border-gray-200 flex items-center justify-center">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container-custom py-5 flex flex-col gap-3">

            <Link to="/services"
              onClick={() => setMenuOpen(false)}
              className="mobile-link">
              Services
            </Link>

            {isAuthenticated ? (
              <>
                {/* ✅ Dashboard — mobile, only for PROVIDER and ADMIN */}
                {(isProvider || isAdmin) && (
                  <Link to="/provider-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="mobile-link flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                <Link to="/my-bookings"
                  onClick={() => setMenuOpen(false)}
                  className="mobile-link">
                  My Bookings
                </Link>

                <Link to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="mobile-link">
                  Profile
                </Link>

                <button onClick={handleLogout}
                  className="bg-red-50 text-red-500 rounded-xl py-3 font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-blue-600 text-white rounded-xl py-3 text-center font-semibold">
                  Register
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;