import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

