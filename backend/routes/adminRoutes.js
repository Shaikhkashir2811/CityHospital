import express from "express";
import { registerAdmin, loginAdmin,addDoctor,verifyDoctor,  completeRegistration,updateDateSlots,getAdminDashboardData} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import  {bookAppointment} from "../controllers/Usercontroller.js";
import { getAllDoctors, deleteDoctor,changeConsultationStatus,cancelAppointment } from '../controllers/adminController.js';
const router = express.Router();

// Auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Example
router.get("/dashboard", protectAdmin, getAdminDashboardData);
router.post('/change-consultation-status', protectAdmin, changeConsultationStatus);
router.post('/cancel-appointment', protectAdmin, cancelAppointment);

// Add Doctor (Admin only)

router.post("/add-doctor", addDoctor); 
router.post("/complete-registration", completeRegistration);
// Verify Doctor (Public link from email)
router.get("/verify/:token", verifyDoctor);
router.post('/delete-doctor', protectAdmin, deleteDoctor);
router.get('/all-doctors',  getAllDoctors);
// Add this line among your other admin routes
router.post('/update-date-slots', protectAdmin, updateDateSlots);
router.post('/book-appointment', bookAppointment);

export default router;