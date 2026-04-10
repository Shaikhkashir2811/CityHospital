import express from 'express';
import { login } from '../controllers/adminController.js';
import { updateDoctorProfile } from '../controllers/doctorController.js';   
import { uploadImage } from '../controllers/doctorController.js';
import { upload } from '../config/cloudinary.js';
import {authDoctor,authDoctor1} from '../middleware/authDoctor.js';
import { getDoctorProfile } from '../controllers/doctorController.js';
import { completeConsultation, getDoctorDashboard } from '../controllers/doctorController.js';
import { authUser } from '../middleware/authMiddleware.js';
const doctorRouter = express.Router();

// This becomes /api/doctor/login because of the prefix in server.js
doctorRouter.post('/login', login); 

// GET the profile data when page loads
doctorRouter.get('/profile', authDoctor, getDoctorProfile);

// POST the updates when clicking save
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

// POST the image
doctorRouter.post('/upload-image', authDoctor, upload.single('image'), uploadImage);

// GET the dashboard data
doctorRouter.get('/dashboard', authDoctor1, getDoctorDashboard);

// POST to complete a consultation
doctorRouter.post('/complete-appointment', authDoctor1, completeConsultation);


export default doctorRouter;