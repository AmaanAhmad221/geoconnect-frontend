import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Shield,
  Calendar, Camera, Loader, Trash2
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8080';

const Profile = () => {
  const { user, isAdmin, isProvider, isCustomer, login, token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getPhotoUrl = () => {
    if (user?.profilePhoto) {
      return `${BACKEND_URL}/uploads/${user.profilePhoto}`;
    }
    return null;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/api/users/profile-photo',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Update user in context
      const updatedUser = response.data.data;
      login(updatedUser, token);
      toast.success('Profile photo updated! 📸');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Delete profile photo?')) return;
    try {
      await api.delete('/api/users/profile-photo');
      const updatedUser = { ...user, profilePhoto: null };
      login(updatedUser, token);
      toast.success('Photo deleted!');
    } catch (error) {
      toast.error('Failed to delete photo!');
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return 'bg-red-100 text-red-600 border-red-200';
    if (isProvider) return 'bg-green-100 text-green-600 border-green-200';
    return 'bg-blue-100 text-blue-600 border-blue-200';
  };

  const getRoleDescription = () => {
    if (isAdmin) return 'You have full access to manage the platform';
    if (isProvider) return 'You can create and manage your services';
    return 'You can browse and book services';
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 py-4 border-b
      border-gray-100 last:border-0">
      <div className="w-10 h-10 bg-blue-50 rounded-full
        flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 font-medium
          uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-gray-800 font-medium">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm
          overflow-hidden mb-5">

          {/* Cover */}
          <div className="bg-gradient-to-r from-blue-600
            to-indigo-600 h-24" />

          {/* Avatar + Name */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row
  sm:items-end sm:justify-between
  gap-4 -mt-10 mb-4">

              {/* Avatar with upload */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full
                  border-4 border-white shadow-md overflow-hidden
                  flex items-center justify-center">
                  {getPhotoUrl() ? (
                    <img
                      src={getPhotoUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-blue-600" size={36} />
                  )}
                </div>

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-7 h-7
                    bg-blue-600 rounded-full flex items-center
                    justify-center text-white hover:bg-blue-700
                    transition shadow-md">
                  {uploading
                    ? <Loader size={12} className="animate-spin" />
                    : <Camera size={12} />
                  }
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                {user?.profilePhoto && (
                  <button
                    onClick={handleDeletePhoto}
                    className="p-2 text-red-400 hover:text-red-600
                      hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                )}
                <span className={`px-4 py-1.5 rounded-full text-sm
                  font-semibold border ${getRoleBadge()}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {user?.name}
            </h2>
            <p className="text-gray-500">@{user?.username}</p>
            <p className="text-gray-400 text-sm mt-1">
              {getRoleDescription()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              📸 Click the camera icon to update photo
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Account Information
          </h3>
          <InfoRow
            icon={<User className="text-blue-500" size={18} />}
            label="Full Name"
            value={user?.name}
          />
          <InfoRow
            icon={<span className="text-blue-500 font-bold text-sm">
              @
            </span>}
            label="Username"
            value={user?.username}
          />
          <InfoRow
            icon={<Mail className="text-blue-500" size={18} />}
            label="Email"
            value={user?.email}
          />
          <InfoRow
            icon={<Phone className="text-blue-500" size={18} />}
            label="Phone"
            value={user?.phone}
          />
          <InfoRow
            icon={<Shield className="text-blue-500" size={18} />}
            label="Role"
            value={user?.role}
          />
          <InfoRow
            icon={<Calendar className="text-blue-500" size={18} />}
            label="Member Since"
            value={user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : null}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Role', value: user?.role || '-' },
            { label: 'Status', value: 'Active' },
            { label: 'Account', value: 'Verified' },
          ].map((stat) => (
            <div key={stat.label}
              className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-lg font-bold text-blue-600">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Role Card */}
        <div className={`rounded-2xl p-5 border
          ${isAdmin ? 'bg-red-50 border-red-200' :
            isProvider ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <Shield
              className={isAdmin ? 'text-red-500' :
                isProvider ? 'text-green-500' : 'text-blue-500'}
              size={24}
            />
            <div>
              <p className={`font-bold
                ${isAdmin ? 'text-red-700' :
                  isProvider ? 'text-green-700' : 'text-blue-700'}`}>
                {isAdmin ? 'Administrator Account' :
                 isProvider ? 'Service Provider Account' :
                 'Customer Account'}
              </p>
              <p className={`text-sm
                ${isAdmin ? 'text-red-500' :
                  isProvider ? 'text-green-500' : 'text-blue-500'}`}>
                {getRoleDescription()}
              </p>
            </div>
          </div>
          {isCustomer && (
            <p className="text-blue-600 text-sm mt-3">
              💡 Want to offer services? Contact admin to upgrade.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;