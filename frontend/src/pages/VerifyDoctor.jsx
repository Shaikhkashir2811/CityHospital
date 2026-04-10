import React, { useState , useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Loader2, CheckCircle } from 'lucide-react';

import api from '../api/api';

const VerifyDoctor = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
    }
  });

  useEffect(() => {
    const checkToken = async () => {
      try {
        // This calls your Backend GET route: router.get("/verify/:token", verifyDoctor);
        const { data } = await api.get(`/api/admin/verify/${token}`);

        if (data.success) {
          console.log("Token is valid, doctor found:", data.doctor.name);
        }
      } catch (err) {
        // If the token is fake, expired, or already used, show an error immediately
        setError("This verification link is invalid or has already expired.");
      }
    };

    if (token) {
      checkToken();
    }
  }, [token]);

  const handleActivate = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirm) {
      return setError("Passwords do not match");
    }

    setError("");
    setLoading(true);

    try {
      // No need for getAuthHeaders() here because:
      // 1. api.js interceptor handles it automatically
      // 2. This is a public route for new users
      const { data } = await api.post('/api/admin/complete-registration', {
        token,
        password: passwords.password
      });

      if (data.success) {
        setDone(true);
      }
    } catch (err) {
      console.error("Activation Error:", err);
      // Picks up the specific error message from your backend (e.g., "Link expired")
      const msg = err.response?.data?.msg || err.response?.data?.message || "Invalid or expired link.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-md">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold">Account Activated!</h2>
        <p className="text-slate-500 mt-2 mb-6">Your profile is now live. You can log in to the doctor dashboard.</p>
        <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Go to Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Set Your Password</h1>
          <p className="text-slate-500 text-sm">Please create a password to activate your staff account.</p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password" required minLength={6}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-green-500"
                value={passwords.password}
                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password" required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-green-500"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black transition-all hover:bg-green-600 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Activate Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyDoctor;