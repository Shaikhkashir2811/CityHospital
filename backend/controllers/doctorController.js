import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import doctorModel from "../models/doctorModel.js"; // Ensure this matches your export
import patientModel from "../models/patients.js"; // Ensure this matches your export
import { cloudinary } from "../config/cloudinary.js"; // Ensure this path is correct


export const updateDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.body;

        const {
            name, age, phone, qualification, specialty,
            description, gender, availableSlots, fees, experience, image
        } = req.body;

        // UPDATED: Check for Object instead of Array
        if (availableSlots && (typeof availableSlots !== 'object' || Array.isArray(availableSlots))) {
            return res.status(400).json({ success: false, message: "Invalid slot format. Expected an Object." });
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                name, age, phone, qualification, specialty,
                description, gender, availableSlots, fees, experience, image
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password -verificationToken");

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, message: "Profile updated!", docData: updatedDoctor });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
export const uploadImage = async (req, res) => {
    try {
        // 1. Check if Multer actually caught the file
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        // 2. Upload the temporary file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            folder: "doctor_profiles"
        });

        // 3. Get doctorId from the middleware (req.body.doctorId)
        const { doctorId } = req.body;

        // 4. Update the Database so the image stays there on refresh
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            { image: result.secure_url },
            { returnDocument: "after" }
        );

        // 5. Send the new URL back to the Frontend
        res.json({
            success: true,
            message: "Image Uploaded!",
            imageURL: result.secure_url
        });

    } catch (error) {
        console.error("Upload Logic Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.body; // Injected by your authDoctor middleware

        // .select('name email specialty image ...') ensures we only get what we need
        const docData = await doctorModel.findById(doctorId).select("name email specialty image age phone qualification description gender experience fees availableSlots");

        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, docData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get all doctors list for Admin

export const getDoctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;

        // 1. Get Doctor's details
        const doctor = await doctorModel.findById(docId);
        if (!doctor) return res.json({ success: false, message: "Doctor not found" });

        // 2. Find all appointments linked to this doctor
        const appointments = await patientModel.find({ docId });

        // --- DATE LOGIC (Fixed Sequence) ---
        const today = new Date(); // ALWAYS define this first
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        // Matches "2026-04-10" format in your DB
        const formattedToday = `${year}-${month}-${day}`; 

        // 3. Filter for Today's Queue (Only those NOT completed)
        const todayQueue = appointments.filter(app => 
            app.slotDate === formattedToday && app.isCompleted === false
        );

        // 4. Calculate Earnings (Only from completed ones)
        const completedAppointments = appointments.filter(app => app.isCompleted === true);
        const totalEarnings = completedAppointments.length * (doctor.fees || 0);

        // 5. Unique Patients (filter out undefined/null emails before putting in Set)
        const uniqueEmails = [...new Set(appointments.map(app => app.email).filter(Boolean))];

        // 6. Final Data Preparation
        const dashData = {
            totalEarnings,
            totalAppointments: appointments.length,
            totalPatients: uniqueEmails.length,
            todayAppointments: todayQueue.length,
            // We reverse todayQueue so the most recent "Today" booking is at the top
            appointments: todayQueue.reverse() 
        };

       
        res.json({ success: true, dashData });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Action: Complete Consultation ---
export const completeConsultation = async (req, res) => {
    try {
        // 1. Destructure the key you sent from Frontend
        const { appointmentId } = req.body;

        // 2. Use that ID to update the record
        const updatedAppointment = await patientModel.findByIdAndUpdate(
            appointmentId,
            { isCompleted: true },
            { returnDocument: "after" }
        );

        if (!updatedAppointment) {
            console.log("Updated Appointment: null (ID not found in DB)");
            return res.json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: "Marked as completed" });

    } catch (error) {
        console.log("Controller Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

const changeConsultationStatus = async (id, currentStatus) => {
    // If already completed, do nothing (buttons will be disabled anyway)
    if (currentStatus) return;

    try {
        const { data } = await axios.post(
            `${backendUrl}/api/admin/change-consultation-status`,
            { patientId: id },
            getAuthHeaders()
        );
        if (data.success) {
            toast.success('Consultation marked as done!');
            fetchDashData();
        }
        else toast.error(data.message);
    } catch {
        toast.error('Status update failed');
    }
};

