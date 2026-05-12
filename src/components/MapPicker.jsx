import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader, Navigation } from 'lucide-react';

// ✅ Fix Leaflet default marker icon bug in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker for user
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom red marker for provider
const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Click handler inside map
const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapPicker = ({
  onLocationSelect,    // callback(lat, lng, address)
  providerLat,         // provider's lat
  providerLng,         // provider's lng
  providerName,        // provider name for popup
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    providerLat && providerLng
      ? [providerLat, providerLng]
      : [18.5204, 73.8567] // Default: Pune
  );

  // Auto detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({ lat, lng });
        setSelectedLocation({ lat, lng });
        setMapCenter([lat, lng]);

        // Reverse geocode to get address
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
        setDetecting(false);
      },
      (error) => {
        console.error('Location error:', error);
        setDetecting(false);
        alert('Could not detect location. Please click on the map to select.');
      },
      { timeout: 10000 }
    );
  };

  // Free reverse geocoding using OpenStreetMap Nominatim
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

  const handleMapClick = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setMapCenter([lat, lng]);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onLocationSelect(lat, lng, addr);
  };

  return (
    <div className="space-y-3">

      {/* Auto detect button */}
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

      {/* Selected address display */}
      {address && (
        <div className="flex items-start gap-2 p-3 bg-blue-50
          rounded-xl border border-blue-100">
          <MapPin size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">{address}</p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200
        shadow-sm" style={{ height: '280px' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={mapCenter.join(',')}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationSelector onLocationSelect={handleMapClick} />

          {/* User/selected location marker */}
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={userIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">📍 Your Location</p>
                  <p className="text-gray-500 text-xs mt-1">{address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Provider location marker */}
          {providerLat && providerLng && (
            <Marker
              position={[providerLat, providerLng]}
              icon={providerIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">🔧 {providerName}</p>
                  <p className="text-gray-500 text-xs">Service Provider</p>
                </div>
              </Popup>
            </Marker>
          )}

        </MapContainer>
      </div>

      <p className="text-xs text-gray-400 text-center">
        📌 Click anywhere on the map to change your location
      </p>
    </div>
  );
};

export default MapPicker;