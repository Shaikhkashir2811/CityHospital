import express from "express";
import  {bookAppointment} from "../controllers/Usercontroller.js";
const router = express.Router();


router.post('/book-appointment', bookAppointment);

export default router;