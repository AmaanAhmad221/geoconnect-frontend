import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import AdminPanel from './pages/AdminPanel';  // ✅ added

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          {/* Protected — any logged in user */}
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Protected — PROVIDER and ADMIN */}
          <Route path="/provider-dashboard" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-service" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <CreateService />
            </ProtectedRoute>
          } />
          <Route path="/edit-service/:id" element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <EditService />
            </ProtectedRoute>
          } />

          {/* Protected — ADMIN only ✅ added */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;