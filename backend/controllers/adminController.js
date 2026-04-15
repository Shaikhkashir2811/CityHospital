import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import Admin from "../models/Admin.js";
import doctorModel from "../models/doctorModel.js"; // Ensure this path is correct
import patientModel from "../models/patients.js"; // Ensure this path is correct


// Register Admin (only once or protected later)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ msg: "Admin created", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "ADMIN" }, // ✅ make role uppercase
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    // ✅ IMPORTANT FIX
    res.json({
      msg: "Login successful",
      token,
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "ADMIN"
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const { name, email, category } = req.body;

    // 1. Check if doctor already exists
    const existing = await doctorModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, msg: "Doctor already exists" });
    }

    // 2. Create a Verification Token (Valid for 24h)
    const verificationToken = jwt.sign(
      { email, name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 3. Create the Doctor in MongoDB (Unverified status)
    const newDoctor = new doctorModel({
      name,
      email,
      category,
      isVerified: false,
      verificationToken
    });
    await newDoctor.save();

    // 4. Setup Transporter using your App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // shaikhkashir93@gmail.com
        pass: process.env.EMAIL_PASS  // Your 16-digit code (no spaces)
      }
    });

    // This looks for the FRONTEND_URL variable on Render; 
    // if it doesn't find it, it defaults to localhost for your local testing.

    const frontendUrl = process.env.FRONTEND_URL || "https://city-hospital-sepia.vercel.app";

    const verificationUrl = `${frontendUrl}/verify-doctor/${verificationToken}`;

    const mailOptions = {
      from: `"CityHospital Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'CityHospital - Staff Verification Required',
      html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;">
                    <h2 style="color: #16a34a;">Welcome to CityHospital</h2>
                    <p>Hello Dr. ${name},</p>
                    <p>You have been invited to join our digital healthcare platform as a <strong>${category}</strong> specialist.</p>
                    <p>Please click the button below to verify your email and activate your staff account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Verify My Account</a>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">This link will expire in 24 hours. If you did not expect this invitation, please ignore this email.</p>
                </div>
            `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, msg: "Verification email sent successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- NEW: Verify Doctor (Called when they click the link) ---
export const verifyDoctor = async (req, res) => {
  try {
    const { token } = req.params;

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find doctor and update
    const doctor = await doctorModel.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true, verificationToken: null },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    res.json({ msg: "Email verified successfully! You can now log in." });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired verification link." });
  }
};



export const completeRegistration = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1. Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Hash the password provided by the doctor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Update the doctor: Set password and mark as verified
    const doctor = await doctorModel.findOneAndUpdate(
      { email: decoded.email },
      {
        password: hashedPassword,
        isVerified: true,
        verificationToken: null
      },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, msg: "Doctor not found" });

    res.status(200).json({ success: true, msg: "Account activated successfully!" });
  } catch (err) {
    res.status(400).json({ success: false, msg: "Invalid or expired link." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. First, check if the user is an Admin
    let user = await Admin.findOne({ email });
    let role = 'ADMIN';

    // 2. If not an Admin, check the Doctor collection
    if (!user) {
      user = await doctorModel.findOne({ email });
      role = 'DOCTOR';
    }

    // 3. If still no user found
    if (!user) {
      return res.status(404).json({ success: false, msg: "Account not found with this email." });
    }

    // 4. For Doctors, ensure they have verified/activated their account
    if (role === 'DOCTOR' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        msg: "Account pending activation. Please check your email to set a password."
      });
    }

    // 5. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid email or password." });
    }

    // 6. Generate JWT Token with the Role included
    const token = jwt.sign(
      { id: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Send success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role // This tells React which NavBar to show
      },
      msg: `Welcome back, ${user.name}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Server error during login." });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Delete a doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    await doctorModel.findByIdAndDelete(docId);
    res.json({ success: true, message: "Doctor removed from system" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


// controllers/adminController.js

export const updateDateSlots = async (req, res) => {
  try {
    const { docId, date, slots, days, startDate, endDate } = req.body;

    // 1. Validation: Ensure we have the doctor
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const update = {};
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 2. Logical Filter: Verify the specific 'date' matches the 'days' rule
    if (date && days && days.length > 0) {
      const targetDate = new Date(date);
      const dayOfWeek = dayMap[targetDate.getDay()]; // Converts date to 'Mon', 'Tue', etc.

      // Only proceed with availableSlots if the date matches the selected days
      if (days.includes(dayOfWeek)) {
        update[`availableSlots.${date}`] = slots;
      } else {
        console.log(`Skipping ${date} because it is a ${dayOfWeek}, which was not selected.`);
      }
    }

    // 3. Update Recurring Schedule (The "Rule")
    if (days && days.length > 0 && startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);

      if (!isNaN(sDate) && !isNaN(eDate)) {
        // $addToSet prevents duplicate rule entries
        update.$addToSet = {
          recurringSchedule: {
            startDate: sDate,
            endDate: eDate,
            days: days,
            slots: slots || []
          }
        };
      }
    }

    // 4. Perform Atomic Update
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      update,
      { 
        returnDocument: 'after', 
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: "Schedule synchronized successfully",
      availableSlots: updatedDoctor.availableSlots,
      recurringSchedule: updatedDoctor.recurringSchedule
    });

  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAdminDashboardData = async (req, res) => {
  try {
    // Run counts in parallel for speed
    const [totalDoctors, totalAppointments, latestAppointments] = await Promise.all([
      doctorModel.countDocuments({}),
      patientModel.countDocuments({}),
      patientModel.find({}).sort({ createdAt: -1 }).limit(6)
    ]);

    // Optimized Revenue Calculation using MongoDB Aggregation
    const revenueData = await patientModel.aggregate([
      {
        $lookup: {
          from: "doctors", // The name of your doctors collection
          localField: "docId",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      { $unwind: "$doctorInfo" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$doctorInfo.fees" }
        }
      }
    ]);

    const dashData = {
      totalDoctors,
      totalAppointments,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      latestAppointments
    };


    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Toggle Consultation Status
// Change Consultation Status
export const changeConsultationStatus = async (req, res) => {
  try {
    const { patientId } = req.body; // Expecting 'patientId' from frontend

    const appointment = await patientModel.findById(patientId);
    if (!appointment) return res.json({ success: false, message: "Not Found" });

    // Toggle status
    const updated = await patientModel.findByIdAndUpdate(
      patientId,
      { isCompleted: !appointment.isCompleted },
      { returnDocument: 'after' } // Fixes your console warning
    );

    res.json({ success: true, message: "Status Updated", updated });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Cancel/Delete Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { patientId } = req.body;
    const appointment = await patientModel.findById(patientId);

    if (!appointment) return res.json({ success: false, message: "Appointment not found" });

    // Logic to remove slot from doctor's schedule
    const { docId, slotDate, slotTime } = appointment;
    const doctor = await doctorModel.findById(docId);

    if (doctor) {
      let slots_booked = doctor.slots_booked;
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slots_booked }, { returnDocument: 'after' });
    }

    await patientModel.findByIdAndDelete(patientId);
    res.json({ success: true, message: "Appointment Cancelled & Slot Freed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


