import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'patient', required: false, default: null }, 
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    doctorName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: { type: String, default: "" },
    
    // --- ADD THESE THREE FIELDS ---
    slotTime: { type: String, required: true }, // e.g., "10:30 AM"
    slotDate: { type: String, required: true }, // e.g., "2026-04-09"
    isCompleted: { type: Boolean, default: false }, 
    
    date: { type: Number, default: Date.now }
}, { timestamps: true }); // Adding timestamps is better for "Latest Appointments" sorting

const patientModel = mongoose.models.patient || mongoose.model("patient", patientSchema);
export default patientModel;