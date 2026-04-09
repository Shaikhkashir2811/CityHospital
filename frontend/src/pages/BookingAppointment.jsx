import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/navbar';
import { Search, Filter, Award, ChevronRight, IndianRupee, Loader2, Stethoscope } from 'lucide-react';
import api from '../api/api';

const FindDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "General Physician", "Gynecologist", "Dermatologist", "Pediatrician", "Neurologist", "Gastroenterologist", "Cardiologist"];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        // 1. Use 'api' instead of 'axios'
        // 2. Use the relative path (the baseURL handles the rest)
        const res = await api.get('/api/admin/all-doctors');

        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        // Optional: Add a toast notification for better UX
        // toast.error("Could not load doctor list"); 
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc =>
    (category === "All" || doc.specialty === category) &&
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pt-20"> {/* Set background to pure white */}
      <NavBar />

      <header className="bg-white border-b border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Find a Specialist</h1>
          <p className="text-slate-500 mb-8">Book an appointment with our highly experienced doctors</p>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by doctor name..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="pl-12 pr-10 py-4 rounded-2xl border border-slate-200 bg-white outline-none font-semibold text-slate-700 cursor-pointer shadow-sm appearance-none"
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="group relative bg-white rounded-[2rem] p-1 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                {/* Gradient Border Effect on Hover */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Content */}
                <div className="relative bg-white rounded-[1.9rem] p-5 border border-slate-100 h-full flex flex-col transition-colors duration-300 group-hover:border-transparent">

                  {/* Doctor Image & Badge */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-emerald-100">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info Section */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-tight mb-1">Name:</h3>
                      <p className="text-xl font-bold text-slate-900 leading-tight">
                        {doc.name}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-emerald-50 rounded-md">
                          <Award size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Experience:</p>
                          <p className="text-sm font-semibold text-slate-700">{doc.experience} + Years of Experience</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-emerald-50 rounded-md">
                          <IndianRupee size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Consultation Fees:</p>
                          <p className="text-lg font-bold text-slate-900">{doc.fees}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Button */}
                  <button
                    onClick={() => navigate(`/appointment/${doc._id}`)}
                    className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 group-hover:shadow-emerald-200 active:scale-95"
                  >
                    Book Appointment
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FindDoctor;