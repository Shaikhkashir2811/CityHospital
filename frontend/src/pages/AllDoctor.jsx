import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/api';
import {
  IndianRupee, UserCircle, X, Save, Plus, Search, SlidersHorizontal,
  Calendar, Clock, ChevronDown, Trash2
} from 'lucide-react';


const CATEGORIES = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'General Physician', 'Psychiatrist', 'Dentist', 'ENT'];

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Multi-date slot builder: { date -> [slots] }
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [targetDate, setTargetDate] = useState('');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  const getAuthHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
  }
});

  /* ── Fetch All Doctors ── */
const fetchDoctors = async () => {
  try {
    setLoading(true);

    // Replacement: 
    // - Use 'api' for the base URL logic
    // - Call 'getAuthHeaders()' for the security tokens
    const { data } = await api.get('/api/admin/all-doctors', getAuthHeaders());

    if (data.success) {
      setDoctors(data.doctors);
    } else {
      toast.error(data.message || "Failed to load doctors");
    }
  } catch (err) {
    console.error('Fetch failed', err);
    toast.error(err.response?.data?.message || "Server error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchDoctors(); }, []);

  // Filter doctors
  const filtered = doctors.filter(doc => {
    const matchSearch = doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || doc.specialty === activeCategory;
    return matchSearch && matchCat;
  });

  const openModal = (doc) => {
    setSelectedDoc(doc);
    setDateSlotMap({});
    setTargetDate('');
    setIsModalOpen(true);
  };

  const addSlot = () => {
    if (!targetDate) return alert('Please select a date first.');
    const slot = `${hour}:${minute} ${period}`;
    setDateSlotMap(prev => {
      const existing = prev[targetDate] || [];
      if (existing.includes(slot)) return prev;
      return { ...prev, [targetDate]: [...existing, slot] };
    });
  };

  const removeSlot = (date, idx) => {
    setDateSlotMap(prev => {
      const updated = prev[date].filter((_, i) => i !== idx);
      if (updated.length === 0) { const copy = { ...prev }; delete copy[date]; return copy; }
      return { ...prev, [date]: updated };
    });
  };

  const removeDate = (date) => {
    setDateSlotMap(prev => { const copy = { ...prev }; delete copy[date]; return copy; });
  };

const updateDatabase = async () => {
    // 1. Check if there is anything to save
    const datesToUpdate = Object.keys(dateSlotMap);
    if (datesToUpdate.length === 0) {
        return alert("Please add at least one date and slot.");
    }

    try {
        setLoading(true); // Optional: start loading state

        // 2. Loop through each date in your map and send to backend
        for (const date of datesToUpdate) {
            const slots = dateSlotMap[date];
            
            // Replacement: use 'api' and pass 'getAuthHeaders()' as the third argument
            await api.post(
                '/api/admin/update-date-slots',
                { 
                    docId: selectedDoc._id, 
                    date: date, 
                    slots: slots 
                },
                getAuthHeaders() // Handles Authorization and atoken automatically
            );
        }

        alert(`Schedule Updated successfully for ${datesToUpdate.length} date(s)`);
        setIsModalOpen(false);
        fetchDoctors(); // Refresh your doctor list
    } catch (err) {
        console.error("Update Error:", err.response?.data);
        alert(err.response?.data?.message || "Update failed.");
    } finally {
        setLoading(false);
    }
};

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-8" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); select{background-image:none!important;}`}</style>

      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Doctors</h1>
        </div>

        {/* ── SEARCH + FILTER BAR ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="p-4">
            {/* Search input */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or specialty…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-slate-400 flex-shrink-0" />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RESULTS COUNT ── */}
        <p className="text-xs text-slate-400 font-medium mb-4">
          Showing <span className="text-slate-700 font-bold">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && <> in <span className="text-emerald-600 font-bold">{activeCategory}</span></>}
        </p>

        {/* ── DOCTOR GRID ── */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading doctors…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No doctors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(doc => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />

                {/* Doctor image */}
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  {doc.image
                    ? <img src={doc.image} className="w-full h-full object-cover" alt={doc.name} />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300"><UserCircle size={40} /></div>
                  }
                  {/* Specialty badge overlay */}
                   
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 truncate mb-0.5">Name: {doc.name}</h3>
                  <p className="text-[11px] text-green-400 font-medium mb-3">Qualification: {doc.qualification || 'MBBS'}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wide">Exp.</p>
                      <p className="text-xs font-bold text-slate-700">{doc.experience || '—'} yrs</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-emerald-600 uppercase font-semibold tracking-wide">Fees</p>
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-0.5"><IndianRupee size={10} />{doc.fees}</p>
                    </div>
                  </div>

                  {/* Active status + specialty badge */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                    {doc.specialty && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                        {doc.specialty}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openModal(doc)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-emerald-600 transition-all"
                  >
                    Manage Slots
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MANAGE SLOTS MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400 flex-shrink-0" />

            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">Manage Slots</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedDoc?.name} · {selectedDoc?.specialty}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

              {/* Step 1: Date */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  <Calendar size={11} /> Select Date
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Step 2: Time + Add */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  <Clock size={11} /> Select Time & Add
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <select value={hour} onChange={e => setHour(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none text-slate-800 cursor-pointer">
                      {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => <option key={h}>{h}</option>)}
                    </select>
                    <span className="text-slate-400 font-bold text-sm">:</span>
                    <select value={minute} onChange={e => setMinute(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none text-slate-800 cursor-pointer">
                      {["00","15","30","45"].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <div className="ml-1 flex rounded-lg overflow-hidden border border-slate-200 bg-white">
                      {['AM','PM'].map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={`px-2.5 py-1 text-xs font-bold transition-all ${period === p ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addSlot}
                    className="w-10 h-10 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Slot preview per date */}
              {Object.keys(dateSlotMap).length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Scheduled Slots
                  </label>
                  <div className="space-y-3">
                    {Object.entries(dateSlotMap).sort().map(([date, slots]) => (
                      <div key={date} className="border border-slate-100 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-emerald-600" />
                            <span className="text-xs font-bold text-slate-700">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
                          </div>
                          <button onClick={() => removeDate(date)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="p-2.5 flex flex-wrap gap-1.5">
                          {slots.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg shadow-sm">
                              <Clock size={9} className="text-emerald-500" />
                              {s}
                              <button onClick={() => removeSlot(date, i)} className="text-slate-300 hover:text-red-500 transition-colors ml-0.5">
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(dateSlotMap).length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <Clock size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">Pick a date, select time and tap +</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={updateDatabase}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
                <Save size={15} /> Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDoctors;