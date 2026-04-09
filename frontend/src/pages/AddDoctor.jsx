import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Award, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/api';

const AddDoctor = () => {
  const [formData, setFormData] = useState({ name: '', email: '', category: 'General' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' }); 

  const categories = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'General Physician', 'Psychiatrist', 'Dentist', 'ENT'];

  const getAuthHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
  }
});

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' }); // Clear previous messages

    try {
        const { data } = await api.post(
            '/api/admin/add-doctor', 
            formData, 
            getAuthHeaders()
        );

        if (data.success) {
            setStatus({ 
                type: 'success', 
                message: `Dr. ${formData.name} added successfully!` 
            });
            setFormData({ name: '', email: '', category: 'General' }); // Reset form
        }
    } catch (error) {
    // 1. Log for your own debugging (this shows the 400 in console)
    console.warn("Handled Backend Error:", error.response?.data);

    // 2. Extract the specific message sent by your backend
    // Usually your backend sends: { success: false, message: "Doctor already exists" }
    const serverMessage = error.response?.data?.message || error.response?.data?.msg;

    // 3. Update the UI state
    setStatus({ 
        type: 'error', 
        message: serverMessage || "Registration failed. Please try again." 
    });

} finally {
    setLoading(false);
}
};

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-6 pb-12">
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-3">
            <UserPlus className="text-green-600" size={32} />
            Invite New Doctor
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Send a secure verification link to a doctor's institutional email.
          </p>
        </div>

        <form onSubmit={handleAddDoctor} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Doctor's Full Name</label>
            <input 
              type="text" required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. Dr. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Verified Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" required
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="jane.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Specialization</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select 
                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 bg-white appearance-none focus:ring-4 focus:ring-green-500/10 outline-none font-semibold text-slate-700"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-green-600 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> Processing...</>
            ) : (
              "Send Verification Invitation"
            )}
          </button>
        </form>

        {/* Status Feedback Messages */}
        {status.message && (
          <div className={`mt-8 p-5 rounded-2xl flex items-start gap-4 border ${
            status.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-100' 
            : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="text-green-600 shrink-0" size={24}/>
            ) : (
              <AlertCircle className="text-red-600 shrink-0" size={24}/>
            )}
            <div className="text-sm font-bold leading-relaxed">
              {status.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDoctor;