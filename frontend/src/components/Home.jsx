import React from 'react';
import NavBar from './navbar';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Star,
  ArrowUpRight,
} from 'lucide-react';
const Home = () => {
  // Mock data for Top Specialists
  const specialists = [
    { name: "Dr. Sarah Johnson", role: "Cardiologist", image: "https://i.pravatar.cc/150?img=47" },
    { name: "Dr. Michael Chen", role: "Neurologist", image: "https://i.pravatar.cc/150?img=12" },
    { name: "Dr. Alisha Khan", role: "Pediatrician", image: "https://i.pravatar.cc/150?img=45" },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <NavBar />

      {/* --- Section 1: About the Hospital --- */}
      <section className="py-16 lg:py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-green-600 font-bold text-sm uppercase tracking-widest mb-4">About CityHospital</h2>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              World-Class Healthcare <br /> Within Your Reach.
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              For over 25 years, CityHospital has been at the forefront of medical excellence.
              Our facility combines state-of-the-art technology with a compassionate approach
              to patient care.
            </p>
            <div className="space-y-4">
              {["24/7 Emergency Care", "Expert Specialist Team", "Advanced Diagnostics"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-800 font-semibold">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
              className="rounded-3xl shadow-2xl border-8 border-white"
              alt="Hospital Interior"
            />
          </div>
        </div>
      </section>

      {/* --- Section 2: Top Doctors (Specialists) --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Our Specialists</h2>
              <p className="text-slate-500 mt-2">Consult with the best medical minds in the city.</p>
            </div>
            <Link
            to="/booking"
            className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            View All Doctors
          </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {specialists.map((doc, index) => (
              <div key={index} className="group bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl hover:border-green-100 transition-all cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-5">
                  <img src={doc.image} className="w-full grayscale group-hover:grayscale-0 transition-all duration-500" alt={doc.name} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wide">{doc.role}</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{doc.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="text-yellow-500 fill-yellow-500" size={14} />
                    <span className="text-xs font-bold text-yellow-700">{doc.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Call to Action (Book Consultant) --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-green-600 rounded-[3rem] p-10 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-green-200">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 relative z-10">
            Ready to take care of your health?
          </h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Book your consultation today and skip the waiting room.
            Our digital booking system is secure and instant.
          </p>
          <Link
            to="/booking"
            className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            Book Consultant Now
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Column 1: Brand & Socials */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-green-600 p-2 rounded-lg text-white">
                  <Stethoscope size={24} />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  City<span className="text-green-500">Hospital</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                Providing world-class medical expertise and compassionate care for over 25 years.
              </p>

              {/* Social Buttons with Green Hover */}
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links with Green Hover */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm font-medium">
                {['Home', 'About Us', 'Services', 'Booking', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                      className="hover:text-green-600 hover:translate-x-2 transition-all inline-block cursor-pointer"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Departments */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Departments</h4>
              <ul className="space-y-4 text-sm font-medium">
                {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Emergency'].map((item) => (
                  <li key={item}>
                    <Link
                      to="/services"
                      className="hover:text-green-600 hover:translate-x-2 transition-all inline-block cursor-pointer"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="text-green-500 shrink-0" size={18} />
                  <span className="leading-relaxed text-slate-400">5/B Shakti Society Danilimda Ahmedabad</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="text-green-500 shrink-0" size={18} />
                  <span className="text-slate-400">+91 6358829102</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="text-green-500 shrink-0" size={18} />
                  <span className="text-slate-400">shaikhkashir2876@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>© 2026 CityHospital Medical Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;