import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  IndianRupee, UserCircle, X, Save, Plus, Search, SlidersHorizontal,
  Calendar, Clock, ChevronDown, Trash2
} from 'lucide-react';

import DatePicker from 'react-multi-date-picker';


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
  const [dates, setDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);

  // const [targetDate, setTargetDate] = useState(' ');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');
  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  const getDatesInRange = (start, end) => {
    let dates = [];
    let current = new Date(start);

    while (current <= new Date(end)) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const openModal = (doc) => {
    setSelectedDoc(doc);
    setDates({});
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
    setSelectedDays([]);
  };

  const addSlot = () => {
    if (!startDate || !endDate) {
      return alert('Please select start and end date.');
    }

    const slot = `${hour}:${minute} ${period}`;
    const rangeDates = getDatesInRange(startDate, endDate);

    setDates(prev => {
      let updated = { ...prev };

      rangeDates.forEach(date => {
        const existing = updated[date] || [];

        if (!existing.includes(slot)) {
          updated[date] = [...existing, slot];
        }
      });

      return updated;
    });
  };

  const removeSlot = (date, idx) => {
    setDates(prev => {
      const updated = prev[date].filter((_, i) => i !== idx);
      if (updated.length === 0) { const copy = { ...prev }; delete copy[date]; return copy; }
      return { ...prev, [date]: updated };
    });
  };

  const removeDate = (date) => {
    setDates(prev => { const copy = { ...prev }; delete copy[date]; return copy; });
  };

const updateDatabase = async () => {
  // 1. Get all dates that have slots
  let datesToUpdate = Object.keys(dates).filter(date => dates[date]?.length > 0);
  
  const hasDays = selectedDays && selectedDays.length > 0;
  if (!hasDays) return alert("Please select days of the week.");
  if (!startDate || !endDate) return alert("Please select a date range.");

  // ✅ NEW: Filter dates to only include selected days (Mon, Wed, Fri, etc.)
  // This ensures we only send requests for the days you actually checked
  const filteredDates = datesToUpdate.filter(dateString => {
    const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' }); 
    // dayName will be 'Mon', 'Tue', 'Wed', etc.
    return selectedDays.some(selected => selected.startsWith(dayName));
  });

  if (filteredDates.length === 0) {
    return alert("None of the scheduled dates match your selected days of the week.");
  }

  try {
    setLoading(true);

    // Format days for Mongoose Enum ('Monday' -> 'Mon')
    const formattedDays = selectedDays.map(day => day.substring(0, 3));

    // 2. Parallel Processing using ONLY the filtered dates
    const updatePromises = filteredDates.map(date => {
      return api.post('/api/admin/update-date-slots', {
        docId: selectedDoc._id,
        date: date,
        slots: dates[date],
        days: formattedDays,
        startDate: startDate,
        endDate: endDate
      }, getAuthHeaders());
    });

    await Promise.all(updatePromises);

    alert(`Successfully updated ${filteredDates.length} matching date(s).`);
    setIsModalOpen(false);
    if (fetchDoctors) fetchDoctors();

  } catch (err) {
    console.error("Update Failed:", err);
    alert(err.response?.data?.message || "An error occurred.");
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeCategory === cat
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

            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">

                {/* Section 1: Date Range & Days */}
                <section className="space-y-4">
                  <header className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Calendar size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date Range & Days</h3>
                  </header>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {daysList.map(day => (
                      <label key={day} className="group cursor-pointer">
                        <input
                          type="checkbox"
                          className="hidden"
                          value={day}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDays([...selectedDays, day]);
                            } else {
                              setSelectedDays(selectedDays.filter(d => d !== day));
                            }
                          }}
                        />
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all 
              ${selectedDays.includes(day)
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                          {day.substring(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: Time Selection */}
                <section className="space-y-4">
                  <header className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Set Time Slot</h3>
                  </header>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                      <select
                        value={hour}
                        onChange={e => setHour(e.target.value)}
                        className="bg-transparent text-sm font-bold outline-none text-slate-800 cursor-pointer flex-1"
                      >
                        {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(h => <option key={h}>{h}</option>)}
                      </select>
                      <span className="text-slate-400 font-bold">:</span>
                      <select
                        value={minute}
                        onChange={e => setMinute(e.target.value)}
                        className="bg-transparent text-sm font-bold outline-none text-slate-800 cursor-pointer flex-1"
                      >
                        {["00", "15", "30", "45"].map(m => <option key={m}>{m}</option>)}
                      </select>

                      <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                        {['AM', 'PM'].map(p => (
                          <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${period === p ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={addSlot}
                      className="h-[46px] px-5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-200 transition-all active:scale-95"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                </section>

                {/* Section 3: Preview */}
                <div className="pt-4">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                    Scheduled Review
                  </label>

                  {Object.keys(dates).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(dates).sort().map(([date, slots]) => (
                        <div key={date} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 transition-colors">
                          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-emerald-500" />
                              <span className="text-xs font-bold text-slate-700">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <button onClick={() => removeDate(date)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="p-3 flex flex-wrap gap-2">
                            {slots.map((s, i) => (
                              <div key={i} className="group/item flex items-center gap-2 pl-3 pr-2 py-1.5 bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-xl">
                                {s}
                                <button onClick={() => removeSlot(date, i)} className="p-0.5 rounded-md hover:bg-emerald-200/50 text-emerald-400 hover:text-emerald-600">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Clock size={20} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">No time slots scheduled yet</p>
                    </div>
                  )}
                </div>
              </div>
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