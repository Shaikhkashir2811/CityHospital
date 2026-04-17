import doctorModel from "../models/doctorModel.js";
import patientModel from "../models/patients.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
// import axios from "axios";

// --- 1. PDF Generation Helper ---
const generateAppointmentPDF = (docData, patient, date, time) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fillColor('#10b981').fontSize(26).text('MEDFLOW HOSPITAL', { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
    doc.moveDown();
    doc.fillColor('#333333').fontSize(18).text('Appointment Confirmation Receipt', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#444444').text(`Patient: ${patient.name}`);
    doc.text(`Email: ${patient.email}`);
    doc.text(`Doctor: Dr. ${docData.name}`);
    doc.text(`Date: ${date} | Time: ${time}`);
    doc.end();
  });
};

// --- 2. Main Controller ---


export const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime, name, email, age, gender } = req.body;

    // --- STEP 1: DOCTOR & SLOT VALIDATION ---
    const docData = await doctorModel.findById(docId);
    if (!docData) return res.json({ success: false, message: "Doctor not found." });

    let currentSlots = docData.slots_booked || {};

    if (currentSlots[slotDate] && currentSlots[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "This slot is already booked." });
    }

    // --- STEP 2: UPDATE DOCTOR SLOTS ---
    if (currentSlots[slotDate]) {
      currentSlots[slotDate].push(slotTime);
    } else {
      currentSlots[slotDate] = [slotTime];
    }

    // --- STEP 3: DB PERSISTENCE ---
    const newPatient = new patientModel({
      docId,
      doctorName: docData.name,
      name,
      email,
      age,
      gender,
      slotDate,
      slotTime,
      isCompleted: false
    });

    await newPatient.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: currentSlots });

    // --- STEP 4: GOOGLE CALENDAR LOGIC (The "One-Click" Fix) ---

    // 1. Parse Date (Assumes "10_04_2026")
    const [day, month, year] = slotDate.split('_');

    // 2. Parse Time (Assumes "10:30 AM")
    const [time, modifier] = slotTime.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    } else {
      hours = hours.padStart(2, '0');
    }

    // 3. Format strings for Google (YYYYMMDDTHHMMSS)
    const startTime = `${year}${month}${day}T${hours}${minutes}00`;

    // Calculate end time (adds 30 minutes)
    let endMins = parseInt(minutes) + 30;
    let endHours = hours;
    if (endMins >= 60) {
      endMins -= 60;
      endHours = (parseInt(hours) + 1).toString().padStart(2, '0');
    }
    const endTime = `${year}${month}${day}T${endHours}${endMins.toString().padStart(2, '0')}00`;

    // 4. Construct the URL with all fields pre-filled
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`City Hospital: ${name}`)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Patient: ${name}\nAge: ${age}\nGender: ${gender}\nTime: ${slotTime}`)}&location=${encodeURIComponent("City Hospital")}&sf=true&output=xml`;

    // --- STEP 5: NOTIFICATIONS ---
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const patientMail = {
      from: `"City Hospital" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Appointment Confirmed ✓ — City Hospital`,
      html: `
  <div style="background:#f4f6f8;padding:24px 16px;font-family:sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0F6E56 0%,#1D9E75 100%);padding:28px 28px 24px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.4)" stroke-width="1"/><path d="M14 7v14M7 14h14" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>
          <span style="color:#E1F5EE;font-size:18px;font-weight:500;letter-spacing:0.5px;">City Hospital</span>
        </div>
        <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2L2 8.5v8L13 24l11-7.5v-8L13 2z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 12l3.5 3.5L18 9" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h1 style="color:#ffffff;font-size:20px;font-weight:500;margin:0;">Appointment Confirmed</h1>
      </div>

      <!-- Body -->
      <div style="padding:24px 28px;">
        <p style="font-size:15px;color:#2C2C2A;line-height:1.7;margin:0 0 20px;">
          Hello <strong>${name}</strong>,<br><br>
          Your appointment has been successfully booked. We look forward to seeing you. Please find your appointment details below.
        </p>

        <!-- Info box -->
        <div style="background:#E1F5EE;border-radius:8px;border-left:3px solid #1D9E75;padding:16px 18px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;width:90px;vertical-align:top;">Doctor</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">Dr. ${docData.name}</td></tr>
            <tr><td colspan="2" style="height:0.5px;background:rgba(15,110,86,0.15);padding:0;"></td></tr>
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;">Date</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${slotDate.replace(/_/g, '/')}</td></tr>
            <tr><td colspan="2" style="height:0.5px;background:rgba(15,110,86,0.15);padding:0;"></td></tr>
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;">Time</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${slotTime}</td></tr>
          </table>
        </div>

        <p style="font-size:13px;color:#5F5E5A;line-height:1.6;margin:0 0 20px;">
          Please arrive <strong>10 minutes early</strong> and carry a valid photo ID and any previous medical records if applicable.
        </p>

        
      </div>

      <!-- Footer -->
      <div style="background:#f8fafa;border-top:0.5px solid #e8f0ee;padding:16px 28px;text-align:center;">
        <p style="font-size:11px;color:#888780;line-height:1.6;margin:0;">
          Need to reschedule? <a href="#" style="color:#0F6E56;text-decoration:none;">Manage your appointment</a><br>
          City Hospital &nbsp;·&nbsp; 123 Health Avenue &nbsp;·&nbsp; <a href="#" style="color:#0F6E56;text-decoration:none;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>`
    };

    const doctorMail = {
      from: `"City Hospital" <${process.env.EMAIL_USER}>`,
      to: docData.email,
      subject: `New Appointment: ${name} — ${slotDate.replace(/_/g, '/')} at ${slotTime}`,
      html: `
  <div style="background:#f4f6f8;padding:24px 16px;font-family:sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0F6E56 0%,#1D9E75 100%);padding:28px 28px 24px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:14px;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.4)" stroke-width="1"/><path d="M14 7v14M7 14h14" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>
          <span style="color:#E1F5EE;font-size:18px;font-weight:500;letter-spacing:0.5px;">City Hospital</span>
        </div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);color:#E1F5EE;font-size:12px;padding:4px 12px;border-radius:20px;margin-bottom:8px;">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#9FE1CB"/><path d="M5.5 3.5v3M5.5 8v.5" stroke="#E1F5EE" stroke-width="1.1" stroke-linecap="round"/></svg>
          New appointment alert
        </div>
        <h1 style="color:#ffffff;font-size:20px;font-weight:500;margin:4px 0 0;">Patient Scheduled</h1>
      </div>

      <!-- Body -->
      <div style="padding:24px 28px;">
        <p style="font-size:15px;color:#2C2C2A;line-height:1.7;margin:0 0 20px;">
          Dear <strong>Dr. ${docData.name}</strong>,<br><br>
          A new appointment has been booked for you. Please review the patient details and add it to your calendar.
        </p>

        <!-- Info box -->
        <div style="background:#E1F5EE;border-radius:8px;border-left:3px solid #1D9E75;padding:16px 18px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;width:100px;vertical-align:top;">Patient</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${name}</td></tr>
            <tr><td colspan="2" style="height:0.5px;background:rgba(15,110,86,0.15);padding:0;"></td></tr>
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;">Age / Gender</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${age} yrs / ${gender}</td></tr>
            <tr><td colspan="2" style="height:0.5px;background:rgba(15,110,86,0.15);padding:0;"></td></tr>
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;">Date</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${slotDate.replace(/_/g, '/')}</td></tr>
            <tr><td colspan="2" style="height:0.5px;background:rgba(15,110,86,0.15);padding:0;"></td></tr>
            <tr><td style="padding:6px 0;font-size:11px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.6px;vertical-align:top;">Time</td><td style="font-size:14px;color:#26215C;font-weight:500;padding:6px 0;">${slotTime}</td></tr>
          </table>
        </div>

        <a href="${googleCalendarUrl}" target="_blank" style="display:block;background:#ffffff;color:#0F6E56;text-align:center;padding:13px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;border:1.5px solid #1D9E75;">
          Add to Google Calendar
        </a>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafa;border-top:0.5px solid #e8f0ee;padding:16px 28px;text-align:center;">
        <p style="font-size:11px;color:#888780;line-height:1.6;margin:0;">
          Automated notification · <a href="#" style="color:#0F6E56;text-decoration:none;">Doctor Dashboard</a><br>
          City Hospital &nbsp;·&nbsp; 123 Health Avenue, Ahmedabad
        </p>
      </div>
    </div>
  </div>`
    };

    // Fire emails
    await Promise.all([
      transporter.sendMail(patientMail).catch(() => { }),
      transporter.sendMail(doctorMail)
    ]);

    res.json({ success: true, message: "Appointment Booked Successfully!" });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Critical Error: " + error.message });
  }
};