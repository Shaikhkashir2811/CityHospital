# 🏥 CityHospital

A full-stack **Doctor Appointment Booking System** that connects patients with doctors and provides separate dashboards for **Patients, Doctors, and Admins**.

🌐 **Live Demo:** https://city-hospital-sepia.vercel.app/
📂 **Repository:** https://github.com/Shaikhkashir2811/CityHospital

---

## ✨ Features

* 🔐 Patient, Doctor & Admin authentication
* 👤 Patient registration and login
* 👨‍⚕️ Browse doctors by category
* 📅 Check doctor availability and book appointments
* 📧 Email notifications for appointments
* 🧑‍⚕️ Doctor dashboard for managing appointments and availability
* 🛡️ Admin dashboard for managing doctors, patients and appointments
* ☁️ Cloud image storage with Cloudinary
* 🔒 JWT-based authentication and protected routes

---

## 🛠️ Tech Stack

**Frontend**

* React.js
* Tailwind CSS
* JavaScript
* Axios
* React Router
* Vercel

**Backend**

* Node.js
* Express.js
* MongoDB / MongoDB Atlas
* JWT
* bcrypt
* Cloudinary
* Email Service
* Render

---

## 🔄 Workflow

```text
Patient
   ↓
Sign Up / Login
   ↓
Browse Doctors
   ↓
Select Doctor
   ↓
Check Available Slots
   ↓
Book Appointment
   ↓
Email Confirmation
   ↓
Doctor Dashboard
```

**Admin** → Manage doctors, patients and appointments
**Doctor** → Manage availability and appointments
**Patient** → Book and track appointments

---

## ⚙️ Environment Setup

### Backend

Create `.env` inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

FRONTEND_URL=http://localhost:5173
```

### Frontend

Create `.env` inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

Install and run:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

> For production, update `VITE_API_URL` with your **Render backend URL** and `FRONTEND_URL` with your **Vercel frontend URL**.

---

## ☁️ Deployment

```text
GitHub
  │
  ├── Frontend → Vercel
  │
  └── Backend  → Render
                    │
                    ↓
                MongoDB Atlas
```

---

## 🚀 Future Enhancements

* 💳 Online payment integration
* 📹 Video consultation between doctors and patients
* ⭐ Doctor ratings and reviews
* 📋 Prescription and medical report management

---

## 📸 Screenshots

### 🏠 Home Page

<p align="center">
  <img width="1346" height="603" alt="d1" src="https://github.com/user-attachments/assets/d09e76d5-fe6a-4f78-8ca3-85fcbe6ca6ed" />

</p>

### 👨‍⚕️ Doctors

<p align="center">
  <img width="766" height="483" alt="d2" src="https://github.com/user-attachments/assets/b73160dc-0cfe-42bb-8985-adfa86e92140" />
   <img width="1115" height="594" alt="d5" src="https://github.com/user-attachments/assets/2fba8286-0267-4ae0-96df-c9e60673d9ce" />

</p>

### 📅 Appointment Booking

<p align="center">
  <img width="1345" height="598" alt="d3" src="https://github.com/user-attachments/assets/fd92c604-c70e-4af1-9f80-ff03ab820a5a" />

  <img width="560" height="532" alt="d4" src="https://github.com/user-attachments/assets/6cc65901-e9c4-4ae8-9e7d-2c2fcac6c6a2" />

</p>

### 📊 Dashboard

<p align="center">
  <img width="1117" height="601" alt="d6" src="https://github.com/user-attachments/assets/be53a251-5494-42b4-9591-f1e952405efd" />

</p>

---

<p align="center">
  Made with ❤️ by <b>Shaikh Kashir Mahammed Aarif</b>
</p>
