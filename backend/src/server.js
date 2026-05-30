import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { sendErrorResponse } from "./utils/errorResponse.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import cashbookRoutes from "./routes/cashbookRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/imports", importRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/config", configRoutes);
app.use("/api/cashbook", cashbookRoutes);
app.use("/api/schedule", scheduleRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Pharmacy GPP Backend đang hoạt động", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint không tồn tại" });
});

// Global error handler
app.use((err, req, res, next) => {
  return sendErrorResponse(res, err);
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
