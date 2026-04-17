import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure the CSS is also loaded
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Calendar as CalendarIcon, CreditCard, CheckCircle,
  ChevronLeft, Clock, Award, Briefcase, IndianRupee, Activity,
  Hash, FileText, ChevronDown
} from 'lucide-react';

import api from '../api/api';

/* ── Sub-components defined OUTSIDE the main component ──────────────────────
   This is the fix for the "one letter at a time" input lag bug.
   When these were defined inside AppointmentForm they were recreated on every
   render, causing React to unmount + remount the inputs on each keystroke.    */

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300';

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-emerald-100 ${className}`}
  >
    <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:from-emerald-300 group-hover:to-teal-300 transition-all" />
    <div className="p-6">{children}</div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
      <Icon size={15} className="text-emerald-600" />
    </div>
    <h3 className="text-base font-bold text-slate-900">{title}</h3>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  ) : null;

/* ── Main component ─────────────────────────────────────────────────────── */

const AppointmentForm = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false); // renamed from isPaid for clarity

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slot states
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [slotTime, setSlotTime] = useState('');

  const [patientData, setPatientData] = useState({
    name: '', email: '', age: '', gender: 'Male', bloodGroup: '',
  });
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);


  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
    }
  });

  /* ── fetch doctor ── */

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);

        // Use the route we KNOW exists on your backend
        const res = await api.get('/api/admin/all-doctors');

        if (res.data.success) {
          // Find the specific doctor from the array
          const found = res.data.doctors.find((d) => d._id === docId);

          if (found) {
            setDoctor(found);
          } else {
            console.error("Doctor ID not found in the list");
          }
        }
      } catch (err) {
        console.error('Error fetching doctor list:', err);
      } finally {
        setLoading(false);
      }
    };

    if (docId) {
      fetchDoc();
    }
  }, [docId]);

  /* ── when date changes, look up slots ──
     FIX: date selection no longer lives inside a <form>, so picking a date
     never triggers a form submission / page navigation.                     */
  /* ── inside AppointmentForm.jsx ── */
  /* ── when date changes, look up slots ── */
  useEffect(() => {
    if (!selectedDate || !doctor) {
      setSlotsForDate([]);
      return;
    }

    // 1. Get the Recurring Rule (usually the first one in the array)
    const schedule = doctor.recurringSchedule?.[0];

    if (schedule) {
      const targetDate = new Date(selectedDate);

      // Get the 3-letter shorthand for the selected day (e.g., 'Mon')
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

      // 2. CHECK: If the selected date's day isn't in the allowed days, show nothing
      if (!schedule.days.includes(dayName)) {
        setSlotsForDate([]); // Hide slots for Tuesday, Thursday, etc.
        return;
      }
    }

    // 3. Get available times for this date from the availableSlots object
    const av = doctor.availableSlots;
    let rawSlots = [];
    if (Array.isArray(av)) {
      const dayData = av.find((s) => s.date === selectedDate);
      rawSlots = dayData?.slots || [];
    } else {
      rawSlots = av[selectedDate] || [];
    }

    // 4. Fetch booked times 
    const bookedForThisDate = doctor.slots_booked?.[selectedDate] || [];

    const mapped = rawSlots.map((time) => ({
      time,
      isBooked: bookedForThisDate.includes(time),
    }));

    setSlotsForDate(mapped);
  }, [selectedDate, doctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailValid(false);
      setEmailError('');
    }
  };

  // Called when email input loses focus — does the real verification
  // Inside AppointmentForm.jsx
  const handleEmailBlur = (e) => {
    const value = e.target.value.trim();
    // Regex for basic format checking
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(value)) {
      setEmailError('Please enter a valid email format.');
      setEmailValid(false);
    } else {
      setEmailError('');
      setEmailValid(true); // Verification will happen on the backend when clicking "Book"
    }
  };

  /* ── FIX: booking handler attached to the patient form only ── */
  // Opens the popup (called by the form submit button)
  const handleOpenPayModal = (e) => {
    e.preventDefault();
    setShowPayModal(true);
  };

  // Actually calls the API (called by "Confirm & Pay" inside the popup)
  const handleConfirmPayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = { docId, slotDate: selectedDate, slotTime, ...patientData };
      const res = await api.post('/api/user/book-appointment', payload, getAuthHeaders());
      if (res.data.success) {
        setShowPayModal(false);
        setIsBooked(true);
        toast.success("Appointment Booked!");
      } else {
        toast.error(res.data.message || "Booking failed");
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error. Please try again.");
      setIsSubmitting(false);
    }
  };
  /* ── loading / not-found states ── */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!doctor)
    return (
      <div className="h-screen flex items-center justify-center bg-white text-slate-500 text-sm">
        Doctor not found.
      </div>
    );

  /* ── success screen ── */
  if (isBooked)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-slate-500 text-sm mb-1">
            <span className="font-semibold text-slate-700">{patientData.name}</span>
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}{' '}
            &nbsp;·&nbsp; <span className="text-emerald-600 font-semibold">{slotTime}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );

  /* ── main render ── */
  return (
    <div
      className="min-h-screen bg-white pt-20 pb-20 px-4 md:px-8"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        select { background-image: none !important; }
        .slot-btn { transition: all .15s ease; }
        .slot-btn:not(:disabled):hover { transform: translateY(-1px); }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {showPayModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50 }}
            className="flex items-center justify-center px-4"
            onClick={() => !isSubmitting && setShowPayModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Confirm your booking</h3>
                <p className="text-xs text-slate-400 mt-1">Review details before paying</p>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                {[
                  ['Doctor', doctor.name],
                  ['Patient', patientData.name],
                  ['Date', new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                  ['Time', slotTime],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-semibold ${label === 'Time' ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-semibold">Total fee</span>
                  <span className="text-slate-900 font-extrabold flex items-center gap-0.5">
                    <IndianRupee size={14} />{doctor.fees}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPayment}
                  className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    : <><CreditCard size={16} /> Pay ₹{doctor.fees} & Confirm</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-semibold text-sm transition-colors mb-6"
        >
          <ChevronLeft size={18} /> Back
        </button>

        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
            Book Consultation
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Booking
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ══════════ LEFT: DOCTOR + DATE/SLOT PICKER ══════════
              FIX: date picker is NOT inside the patient <form>.
              Selecting a date just calls setSelectedDate — no form
              submission, no navigation.                             */}
          <div className="space-y-5">

            {/* Doctor Info Card */}
            <Card>
              <SectionTitle icon={User} title="Doctor Details" />

              <div className="flex gap-5 mb-5">
                <div className="flex-shrink-0">
                  <div
                    style={{
                      background:
                        'conic-gradient(from 0deg, #6ee7b7, #34d399, #059669, #a7f3d0, #6ee7b7)',
                      borderRadius: '9999px',
                      padding: 3,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-green-900 truncate">{doctor.name}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                    {doctor.specialty && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                        <Activity size={10} /> {doctor.specialty}
                      </span>
                    )}
                  </div>

                  {/* ── Available Days ── */}
                  {doctor.recurringSchedule?.[0]?.days?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Available days
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isAvailable = doctor.recurringSchedule[0].days.includes(day);
                          return (
                            <span
                              key={day}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold border-2 ${isAvailable
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-300'
                                }`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-green-100 pt-4 space-y-0">
                <InfoItem icon={Hash} label="Age" value={doctor.age} />
                <InfoItem icon={Award} label="Qualification" value={doctor.qualification} />
                <InfoItem icon={Briefcase} label="Experience" value={doctor.experience ? `${doctor.experience} years` : null} />
                <InfoItem icon={Mail} label="Email" value={doctor.email} />
                <InfoItem icon={User} label="Gender" value={doctor.gender} />
                <InfoItem icon={Activity} label="Specialty" value={doctor.specialty} />
                <InfoItem icon={FileText} label="About" value={doctor.description} />
                <InfoItem icon={IndianRupee} label="Consultation Fee" value={doctor.fees ? `${doctor.fees}` : null} />
              </div>
            </Card>

            {/* Slot Picker Card — standalone, no <form> wrapper */}
            <Card>
              <SectionTitle icon={CalendarIcon} title="Select Date & Time" />

              {/* Date input */}
              <div className="mb-5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                  Choose Date
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedDate(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                />
              </div>

              {/* Slots */}
              {selectedDate ? (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                    Available Slots
                    {slotsForDate.length > 0 && (
                      <span className="ml-2 text-emerald-600">
                        — {slotsForDate.filter((s) => !s.isBooked).length} available
                      </span>
                    )}
                  </label>

                  {slotsForDate.length === 0 ? (
                    /* FIX: clear "no slots" message when date has no available slots */
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      <Clock size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold text-slate-500">No slots available for this date.</p>
                      <p className="text-xs text-slate-400 mt-1">Please try a different date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slotsForDate.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => !slot.isBooked && setSlotTime(slot.time)}
                          className={`slot-btn relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${slot.isBooked
                            ? 'bg-red-50 border-red-200 cursor-not-allowed'
                            : slotTime === slot.time
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                        >
                          <span className={`text-[11px] font-bold mb-1 ${slot.isBooked ? 'text-red-400' : slotTime === slot.time ? 'text-white' : 'text-slate-800'
                            }`}>
                            {slot.time}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${slot.isBooked
                            ? 'bg-red-100 text-red-500'
                            : slotTime === slot.time
                              ? 'bg-emerald-400 text-white'
                              : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <CalendarIcon size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">Pick a date to see available slots.</p>
                </div>
              )}
            </Card>
          </div>

          {/* ══════════ RIGHT: PATIENT FORM ══════════ */}
          <div className="space-y-5">
            <Card>
              <SectionTitle icon={User} title="Patient Information" />

              {/* Inline validation banner */}
              {(!slotTime || !selectedDate) && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-700">
                  {!selectedDate
                    ? '① Please select a date and time slot on the left first.'
                    : '② Please select a time slot on the left.'}
                </div>
              )}

              <form onSubmit={handleOpenPayModal} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Full Name
                  </label>
                  <input
                    required
                    name="name"
                    placeholder="John Doe"
                    className={inputCls}
                    value={patientData.name}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Age + Blood Group + Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Age
                    </label>
                    <input
                      required
                      name="age"
                      type="number"
                      placeholder="Years"
                      className={inputCls}
                      value={patientData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Blood Group
                    </label>
                    <input
                      required
                      name="bloodGroup"
                      type="text"
                      placeholder="O+"
                      className={inputCls}
                      value={patientData.bloodGroup}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        className={`${inputCls} appearance-none cursor-pointer`}
                        value={patientData.gender}
                        onChange={handleInputChange}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="patient@gmail.com"
                      className={`${inputCls} pr-10 ${emailError
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                        : emailValid
                          ? 'border-emerald-400 focus:border-emerald-500'
                          : ''
                        }`}
                      value={patientData.email}
                      onChange={handleInputChange}
                      onBlur={handleEmailBlur}
                    />
                    {/* Right-side indicator */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {emailChecking && (
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {!emailChecking && emailValid && (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {!emailChecking && emailError && (
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailChecking && (
                    <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
                      Verifying email...
                    </p>
                  )}
                  {!emailChecking && emailError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{emailError}</p>
                  )}
                  {!emailChecking && emailValid && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">Email verified ✓</p>
                  )}
                </div>

                {/* Booking summary */}
                <div className="mt-2 bg-slate-900 rounded-2xl p-5 text-white space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Booking Summary
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Doctor</span>
                      <span className="font-semibold truncate max-w-[150px]">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Date</span>
                      <span className="font-semibold">
                        {selectedDate ? (
                          new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        ) : (
                          <span className="text-slate-500">Not selected</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Time Slot</span>
                      <span className={`font-semibold ${slotTime ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {slotTime || 'Not selected'}
                      </span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Consultation Fee</span>
                      <span className="text-xl font-extrabold flex items-center gap-0.5">
                        <IndianRupee size={16} /> {doctor.fees}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!slotTime || !selectedDate || !!emailError || !emailValid || emailChecking}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 mt-1 ${!slotTime || !selectedDate || emailError || !emailValid || emailChecking
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400'
                      }`}
                  >
                    <CreditCard size={18} /> Pay & Book Appointment
                  </button>
                </div>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;