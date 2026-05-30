import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

// Tạo mã đơn thuốc
const generatePrescriptionCode = async () => {
  const today = new Date();
  const prefix = `DT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Prescription.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

// @GET /api/prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.patientName = { $regex: search, $options: "i" };

    const total = await Prescription.countDocuments(filter);
    const prescriptions = await Prescription.find(filter)
      .populate("customer", "name phone")
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("items.medicine", "name code requiresPrescription")
      .populate("createdBy", "name");
    if (!prescription) return res.status(404).json({ message: "Không tìm thấy đơn thuốc" });
    res.json(prescription);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const { items, patientName } = req.body;
    if (!patientName || patientName.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập tên bệnh nhân" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Đơn thuốc phải có ít nhất một mặt hàng" });
    }

    for (const item of items) {
      if (!item.medicine) {
        return res.status(400).json({ message: "Vui lòng chọn thuốc cho đơn thuốc" });
      }
      const medicineExists = await Medicine.findOne({ _id: item.medicine, isActive: true });
      if (!medicineExists) {
        return res.status(400).json({ message: `Thuốc không tồn tại hoặc đã bị xóa: ${item.medicine}` });
      }
    }

    const code = await generatePrescriptionCode();
    const prescription = await Prescription.create({
      ...req.body,
      code,
      createdBy: req.user._id,
    });
    res.status(201).json(prescription);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/prescriptions/:id
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!prescription) return res.status(404).json({ message: "Không tìm thấy đơn thuốc" });
    res.json(prescription);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/prescriptions/national/:code - Tra cứu Đơn thuốc Quốc gia
export const getNationalPrescriptionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: "Vui lòng nhập mã đơn thuốc quốc gia" });
    }

    // Lấy 2 thuốc cần kê đơn đang kích hoạt để demo
    const activeMeds = await Medicine.find({ isActive: true, requiresPrescription: true }).limit(2);
    
    // Nếu không tìm thấy thuốc kê đơn, lấy 2 thuốc bất kỳ
    const medsToUse = activeMeds.length > 0 
      ? activeMeds 
      : await Medicine.find({ isActive: true }).limit(2);

    if (medsToUse.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thuốc tương thích trong hệ thống" });
    }

    const mockNationalPrescription = {
      code: code.toUpperCase(),
      patientName: "Nguyễn Văn Bệnh Nhân",
      age: 35,
      gender: "Nam",
      weight: 65,
      diagnosis: "Viêm phọng cấp tính / Cảm cúm chuẩn GPP",
      doctorName: "Bác sĩ Nguyễn Văn Y",
      doctorLicense: "CCHN-001234",
      hospitalName: "Bệnh viện Đa khoa Quốc tế GPP",
      items: medsToUse.map((m, index) => ({
        medicine: {
          _id: m._id,
          name: m.name,
          code: m.code,
          requiresPrescription: m.requiresPrescription,
          sellPrice: m.sellPrice,
          unit: m.unit,
        },
        quantity: index === 0 ? 10 : 5,
        dosage: index === 0 
          ? "Uống 1 viên sau ăn sáng, 1 viên sau ăn tối" 
          : "Uống 1 viên trước khi đi ngủ",
      })),
      status: "pending",
    };

    res.json(mockNationalPrescription);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
