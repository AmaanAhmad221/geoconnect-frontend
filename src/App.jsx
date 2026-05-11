import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          {/* Protected Routes */}
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
          <Route path="/provider-dashboard" element={
  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
    <Route path="/edit-service/:id" element={    // ← add this
  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
    <EditService />
  </ProtectedRoute>
} />
    <ProviderDashboard />
  </ProtectedRoute>
} />
<Route path="/create-service" element={
  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
    <CreateService />
  </ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;