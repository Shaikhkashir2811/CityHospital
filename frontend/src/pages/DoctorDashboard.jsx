import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    IndianRupee,
    TrendingUp,
    Clock,
    UserCheck,
    Bold,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../api/api'

/* ─── sprinkle positions (left & right edges only) ──────────── */
const SPRINKLES = [
    { size: 8, top: '14%', left: '0.6%', delay: '0s', dur: '3.4s' },
    { size: 5, top: '26%', left: '1.2%', delay: '0.5s', dur: '2.8s' },
    { size: 6, top: '42%', left: '0.4%', delay: '1.0s', dur: '3.9s' },
    { size: 4, top: '58%', left: '1.6%', delay: '0.3s', dur: '2.6s' },
    { size: 7, top: '72%', left: '0.8%', delay: '0.8s', dur: '3.2s' },
    { size: 5, top: '14%', right: '0.6%', delay: '0.2s', dur: '3.6s' },
    { size: 7, top: '30%', right: '1.0%', delay: '0.7s', dur: '2.9s' },
    { size: 4, top: '48%', right: '0.5%', delay: '1.2s', dur: '3.3s' },
    { size: 6, top: '64%', right: '1.4%', delay: '0.4s', dur: '4.0s' },
    { size: 8, top: '80%', right: '0.7%', delay: '0.9s', dur: '2.7s' },
];

const STARS = [
    { top: '10%', left: '2.5%', delay: '0.3s', dur: '3.5s' },
    { top: '55%', left: '2.0%', delay: '1.0s', dur: '2.8s' },
    { top: '10%', right: '2.5%', delay: '0.6s', dur: '3.1s' },
    { top: '55%', right: '2.0%', delay: '0.9s', dur: '3.7s' },
];

/* ─── stat config ────────────────────────────────────────────── */
const STATS = (d) => [
    { label: 'Total Patients', val: d?.totalPatients ?? 0, sub: 'This week', icon: Users },
    { label: "Today's Queue", val: d?.todayAppointments ?? 0, sub: 'Appointments', icon: Calendar },
    { label: 'Todays Earnings', val: `₹${(d?.totalEarnings ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee },
];

/* ─── component ──────────────────────────────────────────────── */
const DoctorDashboard = () => {
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
        }
    });

    const fetchDoctorStats = async () => {
    try {
        // 1. Use the 'api' instance
        // 2. Pass 'getAuthHeaders()' as the config object
        const { data } = await api.get(
            '/api/doctor/dashboard', 
            getAuthHeaders()
        );

        console.log("Full API Response:", data);

        if (data.success) {
            setDashData(data.dashData);
            console.log("Dashboard Data Set:", data.dashData);
        } else {
            // Handle cases where success is false but status is 200
            toast.error(data.message || "Failed to fetch dashboard data");
        }
    } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        
        // Handle unauthorized or session expired
        if (err.response?.status === 401) {
            toast.error("Session expired. Please login again.");
        } else {
            toast.error(err.response?.data?.message || "Failed to fetch dashboard data");
        }
    } finally {
        setLoading(false);
    }
};

    const markAsDone = async (id) => {
    try {
        // 1. Use the 'api' instance
        // 2. Pass 'getAuthHeaders()' as the 3rd argument (config)
        const { data } = await api.post(
            '/api/doctor/complete-appointment',
            { appointmentId: id },
            getAuthHeaders()
        );

        if (data.success) {
            toast.success('Completed');
            fetchDoctorStats(); // Refresh your dashboard data
        } else {
            toast.error(data.message || 'Action failed');
        }
    } catch (err) {
        console.error("Complete Appointment Error:", err);
        toast.error(err.response?.data?.message || "Failed to update status");
    }
};

    useEffect(() => { fetchDoctorStats(); }, []);

    /* ── loading ── */
    if (loading) return (
        <div className="dd-loader">
            <div className="dd-spinner" />
        </div>
    );

    const stats = STATS(dashData);

    return (
        <>
            <style>{CSS}</style>

            <div className="dd-page">

                {/* floating sprinkles */}
                {SPRINKLES.map((s, i) => (
                    <span key={i} className="dd-sprinkle" style={{
                        width: s.size, height: s.size,
                        top: s.top, left: s.left, right: s.right,
                        animationDelay: s.delay, animationDuration: s.dur,
                    }} />
                ))}
                {STARS.map((s, i) => (
                    <span key={i} className="dd-star" style={{
                        top: s.top, left: s.left, right: s.right,
                        animationDelay: s.delay, animationDuration: s.dur,
                    }}>✦</span>
                ))}

                <div className="dd-inner">

                    {/* ── HEADER ── */}
                    <div className="dd-header">
                        <div className="dd-live-badge">
                            <span className="dd-live-dot" />
                            Live Dashboard
                        </div>
                        <h1 className="dd-h1">Doctor Dashboard</h1>
                        <p className="dd-date">
                            {new Date().toLocaleDateString('en-IN', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* ── STAT CARDS ── */}
                    <div className="dd-stats">
                        {stats.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="dd-card">
                                    <span className="dd-bubble dd-b1" />
                                    <span className="dd-bubble dd-b2" />
                                    <div className="dd-icon-wrap">
                                        <Icon size={20} color="green" strokeWidth={1.8} />
                                    </div>
                                    <div className="dd-card-label ">{s.label}</div>
                                    <div className="dd-card-val">{s.val}</div>
                                    <div className="dd-card-sub">↑ {s.sub}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── QUEUE ── */}
                    <div className="dd-queue">

                        <div className="dd-shimmer-bar" />

                        <div className="dd-q-header">
                            <div className="dd-q-title">
                                <Clock size={17} color="#3d9a5e" strokeWidth={2} />
                                <span className="dd-q-title-txt">Patient Queue</span>
                            </div>
                            <span className="dd-q-count">
                                {dashData?.appointments?.length ?? 0} Patients
                            </span>
                        </div>

                        {/* desktop table */}
                        <div className="dd-tbl-wrap">
                            <table className="dd-tbl">
                                <thead>
                                    <tr className="dd-thead">
                                        <th className="dd-th" style={{ width: 44, color: 'green-500' }}></th>
                                        <th className="dd-th" >Patient Name</th>
                                        <th className="dd-th">Age  </th>
                                        <th className="dd-th">Gender</th>
                                        <th className="dd-th">Slot Time</th>
                                        <th className="dd-th" style={{ textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashData?.appointments?.map((app) => (
                                        <tr key={app._id} className="dd-row">
                                            <td className="dd-td">
                                                <span className="dd-dot dd-pulse" />
                                            </td>
                                            <td className="dd-td" style={{ fontWeight: 600, textDecoration: 'bold', color: 'text-green-500' }}>
                                                {app.name}
                                            </td>
                                            <td className="dd-td">
                                                <span className="dd-age">{app.age} </span>
                                            </td>
                                            <td className="dd-td">
                                                <span className="dd-age">{app.gender} </span>
                                            </td>
                                            <td className="dd-td">
                                                <span className="dd-time">{app.slotTime}</span>
                                            </td>

                                            <td className="dd-td" style={{ textAlign: 'center' }}>
                                                <button className="dd-btn" onClick={() => markAsDone(app._id)}>
                                                    ✓ Done
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* mobile cards */}
                        <div className="dd-mob-list">
                            {dashData?.appointments?.map((app) => (
                                <div key={app._id} className="dd-mob-card">
                                    <div className="dd-mob-top">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="dd-dot dd-pulse" />
                                            <span style={{ fontWeight: 600, fontSize: 15, color: '#1a3d2b' }}>
                                                {app.name}
                                            </span>
                                        </div>
                                        <span className="dd-time">{app.slotTime}</span>
                                    </div>
                                    <span className="dd-age" style={{ marginBottom: 12, display: 'inline-block' }}>
                                        {app.age} yrs • {app.gender}
                                    </span>
                                    <button className="dd-btn dd-btn-full" onClick={() => markAsDone(app._id)}>
                                        ✓ Mark as Done
                                    </button>
                                </div>
                            ))}
                        </div>

                        {(!dashData?.appointments || dashData.appointments.length === 0) && (
                            <div className="dd-empty">
                                <UserCheck size={34} color="#c6e9d4" strokeWidth={1.3}
                                    style={{ display: 'block', margin: '0 auto 10px' }} />
                                No patients in queue today
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

/* ─── styles ─────────────────────────────────────────────────── */
const CSS = `

  @keyframes dd-spin    { to { transform: rotate(360deg); } }
  @keyframes dd-float   { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-8px) rotate(10deg); } }
  @keyframes dd-pulse   { 0%,100%{ opacity:.45; transform:scale(1); } 50%{ opacity:1; transform:scale(1.25); } }
  @keyframes dd-shimmer { 0%{ background-position:200% center; } 100%{ background-position:-200% center; } }

  /* loader */
  .dd-loader {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: #fff;
  }
  .dd-spinner {
    width: 36px; height: 36px;
    border: 3px solid #d4edda;
    border-top-color: #3d9a5e;
    border-radius: 50%;
    animation: dd-spin .8s linear infinite;
  }

  /*
    PAGE
    ────
    padding-top must clear your navbar.
    Default navbar in this project is ~72px tall,
    so we use 88px (72 + 16px breathing room).
    Adjust the single value below if your navbar is different.
  */
  .dd-page {
    min-height: 100vh;
    background: #ffffff;
    padding-top: 88px;          /* ← change to match your navbar height + gap */
    padding-bottom: 60px;
    padding-left: 24px;
    padding-right: 24px;
    position: relative;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /* full-width container, generous max on large screens */
  .dd-inner {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  /* sprinkles — along outer edges, subtle */
  .dd-sprinkle {
    position: absolute;
    border-radius: 50%;
    background: #a8d5b8;
    pointer-events: none;
    opacity: 0.40;
    animation: dd-float 3s ease-in-out infinite;
  }
  .dd-star {
    position: absolute;
    font-size: 10px;
    color: #a8d5b8;
    pointer-events: none;
    opacity: 0.50;
    line-height: 1;
    animation: dd-float 3s ease-in-out infinite;
  }
  .dd-pulse { animation: dd-pulse 2.5s ease-in-out infinite; }

  /* header */
  .dd-header { margin-bottom: 30px; }

  .dd-live-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: #f0faf4;
    border: 1px solid #c6e9d4;
    color: #3d7a56;
    font-size: 11px; font-weight: 500;
    padding: 4px 12px; border-radius: 20px;
    margin-bottom: 12px;
  }
  .dd-live-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #3d9a5e;
    display: inline-block;
    animation: dd-pulse 2.5s ease-in-out infinite;
  }
  .dd-h1 {
    font-size: 28px; font-weight: 700;
    color: #1a3d2b;
    margin: 0 0 5px;
    letter-spacing: -.3px;
    line-height: 1.2;
  }
  .dd-date {
    font-size: 13px;
    color: green;
    margin: 0;
    font-weight: bold;
  }

  /* stat grid */
  .dd-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .dd-stats { grid-template-columns: repeat(4, 1fr); }
  }

  /* stat card */
  .dd-card {
    background: #ffffff;
    border: 1px solid #e2f0e8;
    border-radius: 20px;
    padding: 22px 20px 18px;
    position: relative;
    overflow: hidden;
    transition: transform .18s, box-shadow .18s;
    cursor: default;
  }
  .dd-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(61,154,94,.09);
  }

  /* bubble decoration — same green green tone as sprinkles/text */
  .dd-bubble {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .dd-b1 {
    width: 70px; height: 70px;
    background: rgba(37, 216, 100, 0.2);
    top: -22px; right: -18px;
  }
  .dd-b2 {
    width: 34px; height: 34px;
    background: rgba(168,213,184,.13);
    bottom: 10px; right: 36px;
  }

  .dd-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: #f0faf4;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .dd-card-label {
    font-size: 10px; font-weight: 600;
    color: #6abf88;
    text-transform: uppercase; letter-spacing: .07em;
    margin-bottom: 6px;
  }
  .dd-card-val {
    font-size: 28px; font-weight: 700;
    color: #1a3d2b;
    line-height: 1.1;
    margin-bottom: 5px;
  }
  .dd-card-sub {
    font-size: 11px;
    color: #b8ddc8;
  }

  /* queue card */
  .dd-queue {
    background: #ffffff;
    border: 1px solid #e2f0e8;
    border-radius: 20px;
    overflow: hidden;
  }

  .dd-shimmer-bar {
    height: 3px;
    background: linear-gradient(90deg, #3d9a5e 0%, #a8d5b8 40%, #3d9a5e 70%, #a8d5b8 100%);
    background-size: 200% auto;
    animation: dd-shimmer 3s linear infinite;
  }

  .dd-q-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid #f0faf4;
    background: #fafffe;
  }
  .dd-q-title { display: flex; align-items: center; gap: 9px; }
  .dd-q-title-txt { font-size: 16px; font-weight: 600; color: #1a3d2b; }
  .dd-q-count {
    font-size: 12px; font-weight: 500;
    color: #3d7a56;
    background: #f0faf4;
    border: 1px solid #c6e9d4;
    padding: 4px 13px; border-radius: 20px;
  }

  /* table */
  .dd-tbl-wrap { display: none; overflow-x: auto; }
  @media (min-width: 640px) { .dd-tbl-wrap { display: block; } }

  .dd-tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
  .dd-thead { background: #fafffe; }
  .dd-th {
    padding: 13px 22px; text-align: left;
    font-size: 10px; font-weight: 600;
    color: #6abf88;
    text-transform: uppercase; letter-spacing: .07em;
    white-space: nowrap;
  }
  .dd-td {
    padding: 15px 22px;
    border-top: 1px solid #f4fbf6;
    color: #2d4a38;
    vertical-align: middle;
    white-space: nowrap;
    font-size: 14px;
  }
  .dd-row:hover .dd-td { background: #fafffe; }

  .dd-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #3d9a5e;
    display: inline-block;
  }
  .dd-age {
    display: inline-block;
    background: #f0faf4;
    color: #3d7a56;
    border: 1px solid #c6e9d4;
    border-radius: 20px;
    padding: 3px 11px;
    font-size: 12px; font-weight: 500;
  }
  .dd-time {
    display: inline-block;
    background: #f0faf4;
    color: #2e7a4a;
    border-radius: 8px;
    padding: 4px 11px;
    font-size: 12px; font-weight: 600;
  }

  /* done button */
  .dd-btn {
    background: linear-gradient(135deg, #52c07a, #2e8b55);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 9px 20px;
    font-size: 12px; font-weight: 600;
    cursor: pointer;
    letter-spacing: .03em;
    box-shadow: 0 2px 10px rgba(46,139,85,.20);
    transition: transform .15s, box-shadow .15s;
    white-space: nowrap;
  }
  .dd-btn:hover  { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(46,139,85,.28); }
  .dd-btn:active { transform: scale(.97); }
  .dd-btn-full { width: 100%; display: block; }

  /* mobile list */
  .dd-mob-list {
    display: flex; flex-direction: column; gap: 12px;
    padding: 16px;
  }
  @media (min-width: 640px) { .dd-mob-list { display: none; } }

  .dd-mob-card {
    background: #fafffe;
    border: 1px solid #e2f0e8;
    border-radius: 16px;
    padding: 15px;
    display: flex; flex-direction: column;
    transition: box-shadow .15s;
  }
  .dd-mob-card:hover { box-shadow: 0 4px 18px rgba(61,154,94,.09); }

  .dd-mob-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }

  /* empty */
  .dd-empty {
    padding: 52px 20px;
    text-align: center;
    font-size: 14px;
    color: #c6e9d4;
  }

  /* ── responsive tweaks ── */
  @media (max-width: 480px) {
    .dd-page      { padding: 82px 14px 40px; }
    .dd-h1        { font-size: 22px; }
    .dd-card-val  { font-size: 22px; }
    .dd-stats     { gap: 10px; }
    .dd-card      { padding: 16px 14px 13px; }
  }
  @media (min-width: 1024px) {
    .dd-page { padding-left: 48px; padding-right: 48px; }
  }
  @media (min-width: 1440px) {
    .dd-page { padding-left: 80px; padding-right: 80px; }
  }
`;

export default DoctorDashboard;