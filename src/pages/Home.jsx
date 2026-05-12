import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Search, Shield, Star,
  Wrench, Zap, Droplets, Paintbrush,
  Wind, ArrowRight, CheckCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const categories = [
    { icon: <Wrench size={28} />, name: 'Plumbing', color: 'bg-blue-100 text-blue-600' },
    { icon: <Zap size={28} />, name: 'Electrical', color: 'bg-yellow-100 text-yellow-600' },
    { icon: <Droplets size={28} />, name: 'Cleaning', color: 'bg-green-100 text-green-600' },
    { icon: <Paintbrush size={28} />, name: 'Painting', color: 'bg-pink-100 text-pink-600' },
    { icon: <Wind size={28} />, name: 'AC Repair', color: 'bg-cyan-100 text-cyan-600' },
    { icon: <Search size={28} />, name: 'More...', color: 'bg-purple-100 text-purple-600' },
  ];

  const features = [
    {
      icon: <MapPin className="text-blue-600" size={32} />,
      title: 'Location Based',
      desc: 'Find services near you using real-time location'
    },
    {
      icon: <Shield className="text-green-600" size={32} />,
      title: 'Verified Providers',
      desc: 'All service providers are verified and trusted'
    },
    {
      icon: <Star className="text-yellow-500" size={32} />,
      title: 'Rated & Reviewed',
      desc: 'Read reviews from real customers before booking'
    },
  ];

  const steps = [
    { num: '1', title: 'Search', desc: 'Find services near your location' },
    { num: '2', title: 'Book', desc: 'Book your preferred provider' },
    { num: '3', title: 'Done', desc: 'Get the service at your doorstep' },
  ];

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
        text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">

          {isAuthenticated && (
            <p className="text-blue-200 text-lg mb-2">
              Welcome back, {user?.name}! 👋
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-6xl
  font-bold mb-6 leading-tight">
            Find Local Services
            <span className="block text-blue-200">Near You</span>
          </h1>

          <p className="text-blue-100 text-base sm:text-lg md:text-xl
  mb-10 max-w-2xl mx-auto">
            Connect with trusted service providers in your area.
            From plumbing to AC repair — we've got you covered!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services"
              className="bg-white text-blue-600 px-5 sm:px-8 py-4 rounded-xl
                font-bold text-lg hover:bg-blue-50 transition
                flex items-center justify-center gap-2 shadow-lg">
              <Search size={28} />
              Find Services
            </Link>

            {!isAuthenticated && (
              <Link to="/register"
                className="border-2 border-white text-white px-5 sm:px-8 py-4
                  rounded-xl font-bold text-lg hover:bg-white
                  hover:text-blue-600 transition
                  flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight size={28} />
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-md mx-auto">
            {[
              { num: '500+', label: 'Providers' },
              { num: '1000+', label: 'Bookings' },
              { num: '4.8★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold">{stat.num}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Our Services
            </h2>
            <p className="text-gray-500">
              Choose from a wide range of professional services
            </p>
          </div>

         <div className="grid grid-cols-2 md:grid-cols-3
lg:grid-cols-6 gap-5">
            {categories.map((cat) => (
              <Link
  key={cat.name}
  to={`/services?category=${cat.name.toUpperCase().replace(/ /g, '_')}`}
  className="group bg-white rounded-2xl border border-gray-100
  p-6 hover:shadow-xl hover:-translate-y-1
  transition duration-300
  flex flex-col items-center cursor-pointer"
>
  <div className={`p-3 rounded-full mb-3 ${cat.color}
    group-hover:scale-110 transition`}>
    {cat.icon}
  </div>

  <span className="text-sm font-medium text-gray-700">
    {cat.name}
  </span>
</Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full
                  flex items-center justify-center text-2xl font-bold
                  mx-auto mb-4 shadow-lg">
                  {step.num}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%]
                    w-[40%] h-0.5 bg-blue-200" />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Why Choose GeoConnect?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title}
                className="p-6 rounded-xl border border-gray-100
                  hover:shadow-lg transition text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 px-4 bg-blue-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of customers finding trusted services near them
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="bg-white text-blue-600 px-5 sm:px-8 py-3 rounded-xl
                  font-bold hover:bg-blue-50 transition">
                Register Free
              </Link>
              <Link to="/login"
                className="border-2 border-white text-white px-5 sm:px-8 py-3
                  rounded-xl font-bold hover:bg-white hover:text-blue-600
                  transition">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="text-blue-400" size={20} />
          <span className="text-white font-bold">GeoConnect</span>
        </div>
        <p className="text-sm">
          © 2026 GeoConnect. Real-Time Service Marketplace.
        </p>
      </footer>
    </div>
  );
};

export default Home;