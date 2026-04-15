import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  // --- Basic Auth & Identity ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  category: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // --- Professional Profile Details ---
  age: { type: Number, default: 0 },
  phone: { type: String, default: "" },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  qualification: { type: String, default: "" },
  specialty: { type: String, default: "" },
  experience: { type: Number, default: 0 },
  fees: { type: Number, default: 0 },
  description: { type: String, default: "" },
  image: { type: String, default: "" },

  // --- UPDATED: DATE-SPECIFIC SCHEDULING ---
  /**
   * Structure: 
   * { 
   * "2026-04-12": ["09:00 - 09:30", "10:00 - 10:30"], 
   * "2026-04-13": ["11:00 - 11:30", "11:30 - 12:00"] 
   * }
   */
  availableSlots: { type: Object, default: {} },

  recurringSchedule: [
  {
    startDate: { type: Date },
    endDate: { type: Date },
    days: [{ 
      type: String, 
      enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
    }],
    slots: [{ type: String }] // e.g. ["09:00 - 09:30"]
  }
],

  // --- BOOKING TRACKER ---
  // Records which specific slots from 'availableSlots' have been taken by patients.
  slots_booked: { type: Object, default: {} },

  date: { type: Number, default: Date.now }
}, { minimize: false }); // 'minimize: false' ensures empty objects {} are still saved in DB

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema);

export default doctorModel;