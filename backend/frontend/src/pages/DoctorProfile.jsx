import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import axios from 'axios';
import {
  User, Mail, Award, Briefcase, IndianRupee, 
  Camera, Edit3, Save, Loader2, Info, Hash, 
  Activity, ChevronDown, CheckCircle2
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */
const FieldLabel = ({ icon: Icon, label }) => (
  <label className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
    <Icon size={12} strokeWidth={2.5} className="text-emerald-500" /> {label}
  </label>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 px-8 pt-8 mb-6 relative z-10">
    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-emerald-100">
      <Icon size={18} className="text-emerald-600" />
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
  </div>
);

const BroadGradientHeader = () => (
  <div className="h-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 w-full relative">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
  </div>
);

/* ─── main component ────────────────────────────────────────── */
const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', age: '', email: '', phone: '', qualification: '',
    specialty: '', description: '', gender: 'Male', experience: '',
    fees: '', image: ''
  });

  const getAuthHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    atoken: localStorage.getItem('atoken') // Including 'atoken' as a backup for your middleware
  }
});

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            // 1. Use the 'api' instance
            // 2. Pass 'getAuthHeaders()' as the configuration argument
            const { data } = await api.get('/api/doctor/profile', getAuthHeaders());

            if (data.success) {
                setFormData(data.docData);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            
            // Optional: Handle 401 specifically if the token is invalid
            if (err.response?.status === 401) {
                console.warn("Unauthorized: Token might be expired.");
            }
        }
    };

    fetchProfile();
}, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading(true);
    
    // 1. Prepare the FormData
    const imageData = new FormData();
    imageData.append('image', file);

    try {
        // 2. Use 'api' instance
        // 3. Pass 'getAuthHeaders()' as the configuration
        const { data } = await api.post(
            '/api/doctor/upload-image', 
            imageData, 
            getAuthHeaders()
        );

        if (data.success) {
            setFormData(prev => ({ ...prev, image: data.imageURL }));
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert(err.response?.data?.message || 'Upload failed.');
    } finally {
        setImageLoading(false);
    }
};

const handleSave = async () => {
    setLoading(true);
    try {
        // 1. Use 'api' instance instead of 'axios'
        // 2. Remove the hardcoded localhost URL
        // 3. Use 'getAuthHeaders()' for authentication
        const { data } = await api.post(
            '/api/doctor/update-profile', 
            formData, 
            getAuthHeaders()
        );

        if (data.success) {
            setIsEditing(false);
            setFormData(data.docData);
            // Optional: add a success toast here if you have one
        }
    } catch (err) {
        console.error("Profile Update Error:", err);
        // Better error message showing the actual backend error if available
        alert(err.response?.data?.message || 'Error saving profile.');
    } finally {
        setLoading(false);
    }
};

  const inputCls = "w-full px-4 py-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2">Physician Management</p>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Personal Credentials</h1>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 w-full md:w-auto justify-center ${
              isEditing ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            {isEditing ? 'Sync Changes' : 'Modify Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: IDENTITY CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden sticky top-28">
              <BroadGradientHeader />
              <div className="p-10 text-center">
                <div className="relative inline-block mb-8">
                  <div className="p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full">
                    <div className="w-32 h-32 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                      {imageLoading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10"><Loader2 size={24} className="animate-spin text-emerald-600" /></div>}
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Profile" /> : <User size={48} className="text-slate-200" />}
                    </div>
                  </div>
                  {isEditing && (
                    <button onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center border-4 border-white hover:bg-slate-900 transition-colors shadow-lg">
                      <Camera size={16} />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">{formData.name || 'Dr. Name'}</h2>
                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">{formData.specialty || 'General Consultant'}</p>

                <div className="mt-10 pt-10 border-t border-slate-100 text-left space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Verification</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} /> VERIFIED
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                    <FieldLabel icon={Mail} label="Contact Point" />
                    <p className="text-sm font-bold text-slate-700 truncate">{formData.email || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS FORM */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <BroadGradientHeader />
              <SectionHeader icon={Info} title="Professional Credentials" />
              <div className="px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { id: 'name', label: 'Full Legal Name', icon: User, type: 'text' },
                  { id: 'qualification', label: 'Academic Qualification', icon: Award, type: 'text' },
                  { id: 'specialty', label: 'Medical Specialty', icon: Activity, type: 'text' },
                  { id: 'experience', label: 'Years of Experience', icon: Briefcase, type: 'number' },
                  { id: 'fees', label: 'Consultation Fee (₹)', icon: IndianRupee, type: 'number' },
                  { id: 'age', label: 'Age', icon: Hash, type: 'number' },
                ].map(f => (
                  <div key={f.id} className="space-y-1">
                    <FieldLabel icon={f.icon} label={f.label} />
                    {isEditing ? (
                      <input type={f.type} className={inputCls} value={formData[f.id]} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} />
                    ) : (
                      <p className="px-1 text-base font-bold text-slate-800">{formData[f.id] || 'Not Specified'}</p>
                    )}
                  </div>
                ))}
                
                <div>
                  <FieldLabel icon={User} label="Gender Identity" />
                  {isEditing ? (
                    <div className="relative">
                      <select className={selectCls} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                    </div>
                  ) : <p className="px-1 text-base font-bold text-slate-800">{formData.gender}</p>}
                </div>

                <div className="md:col-span-2 mt-4">
                  <FieldLabel icon={Edit3} label="Professional Biography" />
                  {isEditing ? (
                    <textarea rows={4} className={`${inputCls} resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  ) : (
                    <div className="p-6 bg-emerald-50/20 rounded-[24px] border border-emerald-50">
                      <p className="text-sm text-slate-700 leading-relaxed font-bold">
                        {formData.description || 'No biography details provided.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* NOTICE SECTION REPLACING SLOTS */}
            <div className="p-8 bg-slate-900 rounded-[32px] text-white flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Activity className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Administrative Note</p>
                <p className="text-sm text-slate-300">
                  Your clinical schedule and available appointment slots are managed directly by the <strong>Hospital Administration</strong>. To request changes to your working hours, please contact the IT helpdesk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;