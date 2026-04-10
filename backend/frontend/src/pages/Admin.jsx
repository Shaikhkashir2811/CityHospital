import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Calendar, IndianRupee, CheckCircle, Clock,
  Trash2, Search, Activity, Stethoscope,
  HeartPulse, ShieldCheck, Sparkles, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../api/api';

/* ─── Stat Card ─────────────────────────────────────────────────── */
const StatCard = ({ label, val, icon: Icon, delay }) => (
  <div
    style={{ animation: 'fadeUp .5s ease both', animationDelay: delay }}
    className="relative bg-white rounded-2xl p-5 flex items-center gap-4 overflow-hidden
               shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(52,211,153,0.15)]
               transition-all duration-300"
  >
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
         style={{background:'radial-gradient(circle,rgba(52,211,153,.12) 0%,transparent 70%)'}}/>
    <div className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{background:'linear-gradient(135deg,#34d399,#059669)',boxShadow:'0 4px 14px rgba(52,211,153,.35)'}}>
      <Icon size={18} className="text-white" strokeWidth={2.2}/>
    </div>
    <div className="relative z-10">
      <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400 mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none">{val}</p>
    </div>
  </div>
);

/* ─── Status Badge ───────────────────────────────────────────────── */
const StatusBadge = ({ done }) => (
  <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
    done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}/>
    {done ? 'Done' : 'Pending'}
  </span>
);

/* ─── Confirm Modal ──────────────────────────────────────────────── */
const ConfirmModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
       style={{background:'rgba(15,23,42,.4)',backdropFilter:'blur(8px)'}}>
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
         style={{animation:'scaleIn .18s ease both'}}>
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
        <Trash2 size={24} className="text-red-500"/>
      </div>
      <h3 className="text-lg font-black text-slate-900 text-center mb-2">Remove Appointment?</h3>
      <p className="text-sm text-slate-400 text-center mb-7 leading-relaxed">
        Permanently remove&nbsp;<span className="font-bold text-slate-700">{name}'s</span>&nbsp;booking. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-2xl text-slate-600 text-sm font-bold bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
          Remove
        </button>
      </div>
    </div>
  </div>
);

/* ─── Today label helpers ────────────────────────────────────────── */
const getTodayLabel = () => {
  const now  = new Date();
  const day  = now.toLocaleDateString('en-IN', { weekday: 'long' });
  const date = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return { day, date };
};

const isToday = (slotDate) => {
  if (!slotDate) return false;
  const now    = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth() + 1;
  const todayD = now.getDate();
  let d, m, y;

  if (slotDate.includes('_')) {
    [d, m, y] = slotDate.split('_').map(Number);
  } else if (slotDate.includes('-')) {
    [y, m, d] = slotDate.split('-').map(Number);
  } else if (slotDate.includes('/')) {
    [d, m, y] = slotDate.split('/').map(Number);
  } else {
    return false;
  }

  return d === todayD && m === todayM && y === todayY;
};

/* ─── localStorage key ───────────────────────────────────────────── */
const DISMISSED_KEY = 'adminDashboard_dismissedIds';

const loadDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveDismissed = (set) => {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  } catch {}
};

/* ═══════════════════════════════════════════════════════════════════
   APPOINTMENT ROW — desktop table row
═══════════════════════════════════════════════════════════════════ */
const AppointmentRow = ({ item, idx, onDismiss, onDelete }) => (
  <tr
    className="row-in hover:bg-emerald-50/40 transition-colors"
    style={{
      animationDelay: `${idx * 0.04}s`,
      borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.04)'
    }}
  >
    {/* Patient */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
             style={{background:'linear-gradient(135deg,#34d399,#059669)',boxShadow:'0 2px 8px rgba(52,211,153,.3)'}}>
          {(item.name || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">{item.name}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[130px]">{item.email}</p>
        </div>
      </div>
    </td>

    {/* Doctor */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={11} className="text-emerald-400 flex-shrink-0"/>
        <span className="text-sm font-semibold text-slate-700">{item.doctorName}</span>
      </div>
    </td>

    {/* Slot */}
    <td className="px-6 py-4">
      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full">
        <Clock size={10} className="text-emerald-500"/>
        {item.slotTime || 'Pending'}
      </div>
    </td>

    {/* Status */}
    <td className="px-6 py-4">
      <StatusBadge done={item.isCompleted}/>
    </td>

    {/* Actions */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => { if (item.isCompleted) onDismiss(item._id); }}
          disabled={!item.isCompleted}
          title={item.isCompleted ? 'Dismiss — remove from list' : 'Waiting for doctor to mark done'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            item.isCompleted
              ? 'cursor-pointer hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-40'
          }`}
          style={item.isCompleted ? {
            background: 'linear-gradient(135deg,#34d399,#059669)',
            boxShadow:  '0 2px 8px rgba(52,211,153,.35)',
            color: '#fff'
          } : {}}
        >
          <CheckCircle size={15} strokeWidth={2.5}/>
        </button>

        <button
          onClick={() => { if (!item.isCompleted) onDelete(item._id, item.name); }}
          disabled={item.isCompleted}
          title={item.isCompleted ? 'Cannot delete a completed appointment' : 'Remove appointment'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            !item.isCompleted
              ? 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-40'
          }`}
        >
          <Trash2 size={14} strokeWidth={2.5}/>
        </button>
      </div>
    </td>
  </tr>
);

/* ═══════════════════════════════════════════════════════════════════
   APPOINTMENT CARD — mobile card layout
═══════════════════════════════════════════════════════════════════ */
const AppointmentCard = ({ item, idx, onDismiss, onDelete }) => (
  <div
    className="row-in bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100"
    style={{ animationDelay: `${idx * 0.05}s` }}
  >
    {/* Top row: avatar + name + status */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
             style={{background:'linear-gradient(135deg,#34d399,#059669)',boxShadow:'0 2px 8px rgba(52,211,153,.3)'}}>
          {(item.name || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
          <p className="text-[10px] text-slate-400 font-medium truncate">{item.email}</p>
        </div>
      </div>
      <StatusBadge done={item.isCompleted}/>
    </div>

    {/* Details row */}
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Doctor */}
      <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
        <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0"/>
        <span className="text-[11px] font-semibold text-slate-600">{item.doctorName}</span>
      </div>
      {/* Slot */}
      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg">
        <Clock size={10} className="text-emerald-500"/>
        {item.slotTime || 'Pending'}
      </div>
    </div>

    {/* Actions row */}
    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
      {/* Done button */}
      <button
        onClick={() => { if (item.isCompleted) onDismiss(item._id); }}
        disabled={!item.isCompleted}
        title={item.isCompleted ? 'Dismiss' : 'Waiting for doctor to mark done'}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
          item.isCompleted
            ? 'cursor-pointer hover:opacity-90 active:scale-95 text-white'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-40'
        }`}
        style={item.isCompleted ? {
          background: 'linear-gradient(135deg,#34d399,#059669)',
          boxShadow:  '0 2px 8px rgba(52,211,153,.35)',
        } : {}}
      >
        <CheckCircle size={13} strokeWidth={2.5}/>
        Mark Done
      </button>

      {/* Delete button */}
      <button
        onClick={() => { if (!item.isCompleted) onDelete(item._id, item.name); }}
        disabled={item.isCompleted}
        title={item.isCompleted ? 'Cannot delete a completed appointment' : 'Remove appointment'}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
          !item.isCompleted
            ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-40'
        }`}
      >
        <Trash2 size={13} strokeWidth={2.5}/>
        Remove
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [dashData, setDashData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ FIX: Load dismissed IDs from localStorage so they persist on refresh
  const [dismissedIds, setDismissedIds] = useState(() => loadDismissed());

  const { day, date } = getTodayLabel();

  const backendUrl     = 'http://localhost:4000';
  // You can keep this here if you prefer manual headers over the interceptor
const getAuthHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
  }
});

/* ── Fetch Dashboard Data ── */
const fetchDashData = async () => {
  try {
    setLoading(true);

    // Replacement: use 'api' instead of 'axios' + 'backendUrl'
    // We pass getAuthHeaders() as the configuration object
    const { data } = await api.get('/api/admin/dashboard', getAuthHeaders());

    if (data.success) {
      setDashData(data.dashData);
    } else {
      toast.error(data.message || 'Failed to fetch data');
    }
  } catch (err) {
    // Detailed error handling
    if (err.response?.status === 401) {
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(err.response?.data?.message || 'Error connecting to server');
    }
    console.error("Dashboard Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchDashData(); }, []);

  /* ── Done button → remove row + persist to localStorage ── */
  const dismissRow = (id) => {
    setDismissedIds(prev => {
      const next = new Set([...prev, id]);
      saveDismissed(next); // ✅ FIX: save to localStorage
      return next;
    });
  };

  /* ── Delete (only for Pending) → backend call ── */
  const confirmDelete = (id, name) => setDeleteTarget({ id, name });

  /* ── Cancel Appointment ── */
const cancelAppointment = async () => {
  if (!deleteTarget) return;
  try {
    // 1. Use 'api' instead of 'axios'
    // 2. Remove '${backendUrl}' and use the relative path
    // 3. Keep 'getAuthHeaders()' as the 3rd argument (config) for POST requests
    const { data } = await api.post(
      '/api/admin/cancel-appointment',
      { 
        patientId: deleteTarget.id, 
        appointmentId: deleteTarget.id, 
        id: deleteTarget.id 
      },
      getAuthHeaders()
    );

    if (data.success) {
      toast.success('Appointment removed.');
      fetchDashData(); // Refresh the dashboard data
    } else {
      toast.error(data.message || 'Could not delete');
    }
  } catch (err) {
    console.error("Cancel Error:", err);
    toast.error(err.response?.data?.message || 'Delete failed');
  } finally {
    setDeleteTarget(null);
  }
};

  /* ── Filtered list: today only + not dismissed + search ── */
  const appointments = useMemo(() => {
    const list = dashData?.latestAppointments || [];
    const todayOnly = list.filter(a => isToday(a.slotDate));
    const visible   = todayOnly.filter(a => !dismissedIds.has(a._id));
    if (!search.trim()) return visible;
    const q = search.toLowerCase();
    return visible.filter(a =>
      a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    );
  }, [dashData, search, dismissedIds]);

  /* ── Loading screen ── */
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100"/>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"/>
        <HeartPulse size={20} className="absolute inset-0 m-auto text-emerald-500"/>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Loading dashboard</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        h1,h2,h3 { font-family: 'Syne', system-ui, sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
        @keyframes floatDot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .row-in { animation: fadeUp .32s ease both; }
      `}</style>

      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.name}
          onConfirm={cancelAppointment}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="min-h-screen bg-white pt-20 sm:pt-24 pb-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">

          {/* ── Page header ── */}
          <div className="mb-8 sm:mb-10" style={{animation:'fadeUp .4s ease both'}}>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={13} className="text-emerald-500"/>
              <span className="text-[9px] font-black uppercase tracking-[.22em] text-emerald-500">Admin Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Medical Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time appointment & revenue overview</p>

            {/* Today date badge */}
            <div className="inline-flex items-center gap-2.5 mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{background:'linear-gradient(135deg,#34d399,#059669)'}}>
                <Calendar size={13} className="text-white"/>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{day}</p>
                <p className="text-sm font-black text-emerald-700">{date}</p>
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
            <StatCard label="Active Doctors" val={dashData?.totalDoctors || 0}       icon={Users}       delay=".05s"/>
            <StatCard label="Total Revenue"  val={`₹${dashData?.totalRevenue || 0}`} icon={IndianRupee} delay=".10s"/>
            <StatCard label="Appointments"   val={dashData?.totalAppointments || 0}  icon={Activity}    delay=".15s"/>
          </div>

          {/* ── Queue box ── */}
          <div className="relative" style={{animation:'fadeUp .5s ease .2s both'}}>

            {/* Glows */}
            <div className="absolute pointer-events-none hidden sm:block"
                 style={{top:'-60px',left:'-80px',width:320,height:320,borderRadius:'50%',
                         background:'radial-gradient(circle,rgba(52,211,153,.13) 0%,transparent 65%)',zIndex:0}}/>
            <div className="absolute pointer-events-none hidden sm:block"
                 style={{bottom:'-70px',right:'-60px',width:360,height:360,borderRadius:'50%',
                         background:'radial-gradient(circle,rgba(16,185,129,.11) 0%,transparent 65%)',zIndex:0}}/>

            {/* Floating dots — hidden on mobile to reduce clutter */}
            {[
              {top:'-18px',left:'18%',s:8,o:.3,delay:'0s'},
              {top:'-10px',left:'70%',s:5,o:.22,delay:'.3s'},
              {bottom:'-14px',left:'30%',s:9,o:.28,delay:'.4s'},
              {bottom:'-20px',left:'60%',s:5,o:.2,delay:'.1s'},
              {top:'15%',right:'-16px',s:6,o:.22,delay:'.5s'},
              {top:'55%',right:'-20px',s:8,o:.25,delay:'.35s'},
            ].map((d,i)=>(
              <div key={i} className="absolute pointer-events-none rounded-full hidden sm:block"
                   style={{top:d.top,left:d.left,bottom:d.bottom,right:d.right,
                           width:d.s,height:d.s,background:`rgba(52,211,153,${d.o})`,
                           animation:`floatDot ${2.5+i*.3}s ease-in-out infinite`,
                           animationDelay:d.delay,zIndex:0}}/>
            ))}

            {/* Ring accents */}
            <div className="absolute pointer-events-none rounded-full hidden sm:block"
                 style={{top:'-30px',right:'12%',width:56,height:56,border:'1.5px solid rgba(52,211,153,.2)',zIndex:0}}/>
            <div className="absolute pointer-events-none rounded-full hidden sm:block"
                 style={{bottom:'-25px',left:'8%',width:40,height:40,border:'1px solid rgba(16,185,129,.18)',zIndex:0}}/>

            {/* ── Card ── */}
            <div className="relative z-10 bg-white rounded-3xl overflow-hidden"
                 style={{boxShadow:'0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'}}>

              {/* Card header */}
              <div className="relative px-4 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                     style={{background:'linear-gradient(90deg,rgba(52,211,153,.04) 0%,transparent 60%)'}}/>
                <div className="relative flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{background:'linear-gradient(135deg,#34d399,#059669)',boxShadow:'0 3px 10px rgba(52,211,153,.3)'}}>
                    <Calendar size={15} className="text-white"/>
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 leading-none">Today's Queue</h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}{search ? ' found' : ''}
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
                  <input
                    type="text"
                    placeholder="Search patient…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 rounded-xl text-sm font-medium text-slate-800
                               placeholder:text-slate-300 outline-none transition-all
                               focus:bg-white focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_1px_rgba(52,211,153,.4)]"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                      <X size={12}/>
                    </button>
                  )}
                </div>
              </div>

              <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(0,0,0,.05) 30%,rgba(0,0,0,.05) 70%,transparent)'}}/>

              {/* ── DESKTOP TABLE (md and above) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[580px]">
                  <thead>
                    <tr>
                      {['Patient','Doctor','Slot','Status','Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-[.2em] text-slate-400 bg-slate-50/50">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center">
                              <Search size={18} className="text-slate-300"/>
                            </div>
                            <p className="text-sm font-bold text-slate-400">No appointments for today</p>
                            {search && <p className="text-xs text-slate-300">Try a different name</p>}
                          </div>
                        </td>
                      </tr>
                    ) : appointments.map((item, idx) => (
                      <AppointmentRow
                        key={item._id || idx}
                        item={item}
                        idx={idx}
                        onDismiss={dismissRow}
                        onDelete={confirmDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS (below md) ── */}
              <div className="md:hidden px-4 py-4 space-y-3">
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Search size={18} className="text-slate-300"/>
                    </div>
                    <p className="text-sm font-bold text-slate-400">No appointments for today</p>
                    {search && <p className="text-xs text-slate-300">Try a different name</p>}
                  </div>
                ) : appointments.map((item, idx) => (
                  <AppointmentCard
                    key={item._id || idx}
                    item={item}
                    idx={idx}
                    onDismiss={dismissRow}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>

              {/* Footer */}
              {appointments.length > 0 && (
                <div className="px-4 sm:px-7 py-4 flex items-center justify-between"
                     style={{borderTop:'1px solid rgba(0,0,0,.04)'}}>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={9} className="text-emerald-300"/>
                    HealthSync · Admin
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    <span className="text-emerald-500 font-black">{appointments.filter(a => a.isCompleted).length}</span>
                    &nbsp;/ {appointments.length} completed
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;